// src/lectures/lectures.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lectures } from './model/lectures.model';
import { LectureDto } from './model/lecture.dto';
import { Course } from '../courses/models/course.model';

// ✅ Fixed import – use the correct file name (plural)
import { CertificateService } from '../certificates/certificates.service';
import { LectureProgress } from './model/lecture-progress.model';

@Injectable()
export class LecturesService {
  constructor(
    @InjectRepository(Lectures)
    private lectureRepository: Repository<Lectures>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(LectureProgress)
    private progressRepository: Repository<LectureProgress>,
    private certificateService: CertificateService,
  ) {}

  async viewLecture(): Promise<Lectures[]> {
    return this.lectureRepository.find({ relations: ['course'] });
  }

  async createLecture(lectureDto: LectureDto, courseId: number): Promise<Lectures> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    const lecture = this.lectureRepository.create({ ...lectureDto, course });
    return this.lectureRepository.save(lecture);
  }

  async updateLecture(id: number, lectureDto: LectureDto): Promise<Lectures> {
    const lecture = await this.lectureRepository.findOne({ where: { id } });
    if (!lecture) throw new NotFoundException('Lecture not found');
    Object.assign(lecture, lectureDto);
    return this.lectureRepository.save(lecture);
  }

  async deleteLecture(id: number) {
    return this.lectureRepository.delete(id);
  }

  async markLectureCompleted(lectureId: number, userId: number) {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['course'],
    });
    if (!lecture) throw new NotFoundException('Lecture not found');

    // Find or create progress record
    let progress = await this.progressRepository.findOne({
      where: {
        lecture: { id: lectureId },
        student: { id: userId },
      },
      relations: ['lecture'],
    });

    if (!progress) {
      // ✅ Fix: create with the full lecture entity, not { id: lectureId }
      progress = this.progressRepository.create({
        lecture: lecture,          // full lecture object
        student: { id: userId },
        completed: true,
      });
    } else {
      if (progress.completed) return { alreadyCompleted: true };
      progress.completed = true;
    }
    await this.progressRepository.save(progress);

    // Check if all lectures are completed
    const totalLectures = await this.lectureRepository.count({
      where: { course: { id: lecture.course.id } },
    });
    const completedCount = await this.progressRepository.count({
      where: {
        student: { id: userId },
        lecture: { course: { id: lecture.course.id } },
        completed: true,
      },
    });

    if (totalLectures === completedCount) {
      await this.certificateService.generateAndSaveCertificate(userId, lecture.course.id);
      return { completed: true, courseCompleted: true };
    }

    return { completed: true, courseCompleted: false };
  }

  async getStudentProgress(courseId: number, userId: number) {
    const lectures = await this.lectureRepository.find({
      where: { course: { id: courseId } },
      relations: ['course'],
    });
    const completedLectures = await this.progressRepository.find({
      where: {
        student: { id: userId },
        lecture: { course: { id: courseId } },
        completed: true,
      },
      relations: ['lecture'],
    });
    const total = lectures.length;
    const completed = completedLectures.length;
    const percentage = total === 0 ? 0 : (completed / total) * 100;

    return {
      total,
      completed,
      percentage,
      completedLectureIds: completedLectures.map(l => l.lecture.id),
    };
  }
}