// src/lectures/lectures.controller.ts (updated)
import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LecturesService } from './lectures.service';
import { LectureDto } from './model/lecture.dto';

@Controller('lectures')
export class LecturesController {
  constructor(private lecturesService: LecturesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async readLecture() {
    return this.lecturesService.viewLecture();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id')
  async createLecture(@Param('id') courseId: number, @Body() lectureDto: LectureDto) {
    return this.lecturesService.createLecture(lectureDto, courseId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateLecture(@Param('id') id: number, @Body() lectureDto: LectureDto) {
    return this.lecturesService.updateLecture(id, lectureDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteLecture(@Param('id') id: number) {
    return this.lecturesService.deleteLecture(id);
  }

  // NEW: mark a lecture as completed
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/complete')
  async completeLecture(@Param('id') lectureId: number, @Req() req) {
    return this.lecturesService.markLectureCompleted(lectureId, req.user.id);
  }

  // NEW: get progress for a course
  @UseGuards(AuthGuard('jwt'))
  @Get('progress/:courseId')
  async getProgress(@Param('courseId') courseId: number, @Req() req) {
    return this.lecturesService.getStudentProgress(courseId, req.user.id);
  }
}