import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './models/course.model';
import { User } from 'src/user/model/user.model';
import { Lectures } from 'src/lectures/model/lectures.model';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([Course, User, Lectures]),
    UserModule,
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}