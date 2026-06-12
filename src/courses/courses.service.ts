import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './models/course.model';
import { QueryFailedError, Repository } from 'typeorm';
import { CourseDto } from './models/course.dto';
import { UpdateCourseDto } from './models/update.dto';
import { User } from 'src/user/model/user.model';
import { Lectures } from 'src/lectures/model/lectures.model';


@Injectable()
export class CoursesService {

    constructor(
        @InjectRepository(Course) private coursRepository: Repository<Course>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Lectures) private lecturesRepository: Repository<Lectures>,
    ) { }

    async getcourses(): Promise<Course[]> {
        return this.coursRepository.find({ relations: ['user'] })
    }

    // courses.service.ts (add this method)

    async getCourseById(id: number): Promise<Course> {
        const course = await this.coursRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async getLecturesForCourse(courseId: number): Promise<Lectures[]> {
        const course = await this.coursRepository.findOne({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');
        return this.lecturesRepository.find({
            where: { course: { id: courseId } },
            relations: ['course'],
        });
    }

    async createCourse(course: CourseDto, userId: number): Promise<Course> {

        const user = await this.userRepository.findOne({ where: { id: userId } })

        if (!user) {
            throw new NotFoundException('User Not found')
        }

        const courses = this.coursRepository.create({
            ...course,
            user
        })

        const savedCourse = await this.coursRepository.save(courses)

        return savedCourse

    }

    async updateCourse(id: number, updateCourse: UpdateCourseDto, userId: number) {

        const user = await this.userRepository.findOne({ where: { id: userId } })
        if (!user) {
            throw new NotFoundException('Cannot Find User')
        }

        const course = await this.coursRepository.findOne({ where: { id } })
        if (!course) {
            throw new NotFoundException('Cannot Find Course')
        }

        Object.assign(course, updateCourse) // ✅ fixed: spreads new values onto course
        return await this.coursRepository.save(course)
    }

    async deleteCourse(id: number) {
        const findCourse = await this.coursRepository.findOne({ where: { id } })
        if (!findCourse) {
            throw new NotFoundException('Cannot Find Course')
        }
        await this.coursRepository.delete(id)
        return { message: 'Course Deleted' }
    }

}