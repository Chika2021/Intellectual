import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LectureDto } from './model/lecture.dto';
import { Lectures } from './model/lectures.model';
import { AuthGuard } from '@nestjs/passport';

@Controller('lectures')
export class LecturesController {
    constructor(private leacureService:LecturesService){}

    @UseGuards(AuthGuard('jwt'))
    @Get()
        async readLecture() {
            return await this.leacureService.viewLecture()
        }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id')
        async createLecture(@Param('id') courseId: number , @Body() lectureDto: LectureDto , @Req() req) {
            // const course = req.course.id
            return await this.leacureService.createLecture(lectureDto,  courseId)
        }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
        async updateLecture(@Param('id') courseId: number,  @Body() lecture: LectureDto) {
        
            return await this.leacureService.updateLecture(+courseId, lecture)
        }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
        async deleteLecture(@Param('id') id: number) {
            return await this.leacureService.deleteLecture(+id)
        }
}
