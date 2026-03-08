import { Body, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lectures } from './model/lectures.model';
import { Repository } from 'typeorm';
import { LectureDto } from './model/lecture.dto';
import { Course } from 'src/courses/models/course.model';

@Injectable()
export class LecturesService {
    constructor(@InjectRepository(Lectures) 
    private leacureRepository: Repository<Lectures>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>){}

    async viewLecture(): Promise<Lectures[]> {
      
        return this.leacureRepository.find({relations: ['course']  })
    }

    async createLecture(lectureDto: LectureDto, courseId: number): Promise<Lectures> {

        const course = await this.courseRepository.findOne({where:{id: courseId}})
        if(!course) {
            throw new NotFoundException('Course Not Found !!!')
        }

        const lecture = this.leacureRepository.create({
            ...lectureDto,
            course: course
        })

        return await this.leacureRepository.save(lecture)
        
    }


    async updateLecture(id: number, lecture: LectureDto) {
        // const course = await this.courseRepository.findOne({where: {id: {courseId}}})
        const updated = await this.leacureRepository.findOne({where:{id}})
        if(!updated) {
            throw new NotFoundException('Cannot Find Lecture')
        }
        await Object.assign(updated)
        
        return await this.leacureRepository.save(updated)
    }

    async deleteLecture(id: number) {
        return await this.leacureRepository.delete(id)
    }
}
