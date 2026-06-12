import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../user/model/user.model';
import { Course } from '../courses/models/course.model';
import { Lectures } from '../lectures/model/lectures.model';
import { Enrollment } from '../payment/models/enrollment.model';
import { UserModule } from '../user/user.module';  // ← import UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course, Lectures, Enrollment]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    UserModule,  // ← makes UserService & JwtStrategy available
  ],
  controllers: [AdminController],
  providers: [AdminService],  // ← remove JwtStrategy from providers
})
export class AdminModule {}