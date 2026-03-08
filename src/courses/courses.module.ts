import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './models/course.model';
import { User } from 'src/user/model/user.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course , User])
  ],
  providers: [CoursesService],
  controllers: [CoursesController]
})
export class CoursesModule {}
