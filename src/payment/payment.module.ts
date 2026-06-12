import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Enrollment } from './models/enrollment.model';
import { Course } from 'src/courses/models/course.model';
import { User } from 'src/user/model/user.model';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Enrollment, Course, User]),
    UserModule,
  ],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}