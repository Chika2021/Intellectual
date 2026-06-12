import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CourseDto } from './models/course.dto';
import { UpdateCourseDto } from './models/update.dto';
import { AuthGuard } from '@nestjs/passport';



@Controller('courses')
export class CoursesController {

    constructor(private courseService: CoursesService) { }

    // ✅ Public — no auth required so courses load for all users
    @Get()
    async getcourse() {
        return await this.courseService.getcourses()
    }

    // courses.controller.ts (add)

    @Get(':id')
    async getCourseById(@Param('id') id: string) {
        return this.courseService.getCourseById(+id);
    }

    @Get(':id/lectures')
    async getLecturesForCourse(@Param('id') id: string) {
        return this.courseService.getLecturesForCourse(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    async createCourse(@Body() course: CourseDto, @Req() req) {
        const user = req.user.id
        if (!user) {
            throw new NotFoundException('User Not Found')
        }
        return await this.courseService.createCourse(course, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    async updateCourse(@Param('id') id: number, @Req() req,
        @Body() updateCourse: UpdateCourseDto) {
        const user = req.user.id
        return await this.courseService.updateCourse(+id, updateCourse, user)
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteCourse(@Param('id') id: number) {
        return await this.courseService.deleteCourse(id)
    }

}