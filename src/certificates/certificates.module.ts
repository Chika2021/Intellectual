// src/certificates/certificates.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificateService } from './certificates.service';
import { CertificateController } from './certificates.controller';
import { CourseCompletion } from './models/course-completion.model';
import { User } from '../user/model/user.model';
import { Course } from '../courses/models/course.model';

@Module({
  imports: [TypeOrmModule.forFeature([CourseCompletion, User, Course])],
  providers: [CertificateService],
  controllers: [CertificateController],
  exports: [CertificateService], // ✅ important for LecturesModule
})
export class CertificateModule {}