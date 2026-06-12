import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role, User } from './model/user.model';
import { Repository } from 'typeorm';
import { RegisterDto } from './model/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './model/login.dto';
import { Enrollment, EnrollmentStatus } from 'src/payment/models/enrollment.model';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Enrollment) private enrollmentRepository: Repository<Enrollment>,
        private jwtService: JwtService
    ) { }

    async users(): Promise<User[]> {
        return await this.userRepository.find()
    }

    async register(users: RegisterDto): Promise<any> {

        const { name, email, password, role } = users

        if (role === Role.ADMIN) {
            throw new UnauthorizedException('You Cannot Be Admin')
        }

        const existingUser = await this.userRepository.findOne({ where: { email } })
        if (existingUser) {
            throw new ConflictException('User Already Registered Please Login')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.userRepository.create({
            name,
            email,
            password: hashedPassword,
            role: role
        })


        await this.userRepository.save(user)

        const token = this.jwtService.sign({ id: user.id, role: user.role })

        return { ...user, token }

    }

    async login(users: LoginDto): Promise<any> {
        const { name, email, password } = users

        const user = await this.userRepository.findOne({ where: { email } })

        if (!user) {
            throw new UnauthorizedException('User Not Registered...')
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            throw new UnauthorizedException('Incorrect Password please try again')
        }

        const token = await this.jwtService.sign({ id: user.id, role: user.role })

        return { ...user, token }



    }

    async updateProfile(id: number, updateData: Partial<RegisterDto>): Promise<User> {
        const user = await this.userRepository.findOneBy({ id })

        if (!user) {
            throw new UnauthorizedException('User Not Found')
        }

        Object.assign(user, updateData)


        if (updateData.password) {
            user.password = await bcrypt.hash(updateData.password, 10)
        }

        return await this.userRepository.save(user)

    }

    async findById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } })
        if (!user) {
            throw new UnauthorizedException('User Not Found')
        }
        return user;
    }

    async getPurchasedCourseIds(userId: number): Promise<number[]> {
        const enrollments = await this.enrollmentRepository.find({
            where: { user: { id: userId }, status: EnrollmentStatus.ACTIVE },
            relations: ['course'],
        });
        return enrollments.map(e => e.course.id);
    }
}
