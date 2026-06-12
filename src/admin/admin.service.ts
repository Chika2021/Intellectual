import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../user/model/user.model';
import { Course } from '../courses/models/course.model';
import { Lectures } from '../lectures/model/lectures.model';
import { Enrollment } from '../payment/models/enrollment.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Lectures)
    private lectureRepository: Repository<Lectures>,
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getAllCourses(): Promise<Course[]> {
    return this.courseRepository.find({ relations: ['user'] });
  }

  async getAllLectures(): Promise<Lectures[]> {
    return this.lectureRepository.find({ relations: ['course'] });
  }

  async getPurchasesOverview() {
    const enrollments = await this.enrollmentRepository.find({
      relations: ['course', 'course.user', 'user'],
    });

    const instructorStats = new Map();

    for (const enrollment of enrollments) {
      const course = enrollment.course;
      if (!course) continue;
      const instructor = course.user;
      if (!instructor) continue;

      const instructorId = instructor.id;
      const instructorName = instructor.name;
      const courseId = course.id;
      const courseName = course.name;

      if (!instructorStats.has(instructorId)) {
        instructorStats.set(instructorId, {
          instructorId,
          instructorName,
          courses: new Map(),
          totalPurchases: 0,
        });
      }
      const stats = instructorStats.get(instructorId);
      if (!stats.courses.has(courseId)) {
        stats.courses.set(courseId, { courseId, courseName, count: 0 });
      }
      stats.courses.get(courseId).count++;
      stats.totalPurchases++;
    }

    return Array.from(instructorStats.values()).map(stat => ({
      instructorId: stat.instructorId,
      instructorName: stat.instructorName,
      totalPurchases: stat.totalPurchases,
      courses: Array.from(stat.courses.values()),
    }));
  }

  async getTotalStudents(): Promise<number> {
    const result = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .select('COUNT(DISTINCT enrollment.userId)', 'count')
      .getRawOne();
    return parseInt(result.count, 10) || 0;
  }

  async getTotalEnrollments(): Promise<number> {
    return this.enrollmentRepository.count();
  }

  async getTotalInstructors(): Promise<number> {
    return this.userRepository.count({ where: { role: Role.INSTRUCTOR } });
  }

  async getTotalAdmins(): Promise<number> {
    return this.userRepository.count({ where: { role: Role.ADMIN } });
  }
}