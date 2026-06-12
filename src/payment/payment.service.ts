import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import axios from 'axios';
import { Course } from 'src/courses/models/course.model';
import { User } from 'src/user/model/user.model';
import { Enrollment, EnrollmentStatus } from './models/enrollment.model';
import { InitiatePaymentDto } from './models/payment.dto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    private configService: ConfigService,
  ) {}

  async initiatePayment(dto: InitiatePaymentDto, userId: number) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // Prevent duplicate purchase — check for an already-active enrollment
    const existing = await this.enrollmentRepository.findOne({
      where: { user: { id: userId }, course: { id: dto.courseId }, status: EnrollmentStatus.ACTIVE },
    });
    if (existing) {
      throw new BadRequestException('You are already enrolled in this course');
    }

    // Paystack expects amount in kobo (smallest currency unit), so multiply by 100
    const amountInKobo = Math.round(course.price * 100);

    const payload = {
      email: dto.email,
      amount: amountInKobo,
      currency: 'NGN',
      metadata: {
        userId,
        courseId: course.id,
        courseName: course.name,
      },
       callback_url: dto.callback_url,
    };

    const response = await axios.post(
      `${this.paystackBaseUrl}/transaction/initialize`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const { authorization_url, reference } = response.data.data;

    // Save a pending enrollment record so we can match it on webhook
    const enrollment = this.enrollmentRepository.create({
      reference,
      user,
      course,
      amountPaid: course.price,
      status: EnrollmentStatus.PENDING,
    });
    await this.enrollmentRepository.save(enrollment);

    return {
      message: 'Payment initiated. Redirect user to the authorization URL.',
      authorization_url,
      reference,
    };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    if (!secretKey) {
      this.logger.error('PAYSTACK_SECRET_KEY is not configured');
      throw new BadRequestException('Missing Paystack secret key');
    }

    // Verify the webhook signature to confirm it really came from Paystack
    const hash = createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    if (hash !== signature) {
      this.logger.warn('Invalid Paystack webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'charge.success') {
      await this.activateEnrollment(event.data);
    }

    return { received: true };
  }

  private async activateEnrollment(data: any) {
    const { reference, metadata } = data;

    if (!reference) {
      this.logger.error('activateEnrollment called with no reference');
      return;
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { reference },
      relations: ['user', 'course'],
    });

    if (!enrollment) {
      this.logger.error(`No enrollment found for reference: ${reference}`);
      return;
    }

    if (enrollment.status === EnrollmentStatus.ACTIVE) {
      this.logger.log(`Enrollment ${reference} already active — skipping (idempotent)`);
      return;
    }

    enrollment.status = EnrollmentStatus.ACTIVE;
    await this.enrollmentRepository.save(enrollment);

    this.logger.log(
      `Enrollment activated — reference: ${reference}, user: ${metadata?.userId ?? enrollment.user?.id}, course: ${metadata?.courseName ?? enrollment.course?.name}`,
    );
  }

  async verifyPayment(reference: string) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');

    const response = await axios.get(
      `${this.paystackBaseUrl}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      },
    );

    const txData = response.data.data;
    const { status, metadata } = txData;

    // activateEnrollment looks up the enrollment by `reference`.
    // Paystack's verify response has `reference` at the top level of txData.
    // Make sure it's present before calling — it always is for a real transaction.
    if (status === 'success') {
      await this.activateEnrollment({ ...txData, reference, metadata });
    }

    return {
      status,
      courseId: metadata?.courseId,
      courseName: metadata?.courseName,
    };
  }

  async getMyEnrollments(userId: number) {
    return this.enrollmentRepository.find({
      where: { user: { id: userId }, status: EnrollmentStatus.ACTIVE },
      relations: ['course'],
    });
  }
}