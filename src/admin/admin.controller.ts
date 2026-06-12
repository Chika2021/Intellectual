import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/role.gaurd';
import { Roles } from '../user/role.decorators';
import { Role } from '../user/model/user.model';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('courses')
  async getAllCourses() {
    return this.adminService.getAllCourses();
  }

  @Get('lectures')
  async getAllLectures() {
    return this.adminService.getAllLectures();
  }

  @Get('purchases/overview')
  async getPurchasesOverview() {
    return this.adminService.getPurchasesOverview();
  }

  @Get('stats')
  async getStats() {
    const [totalStudents, totalEnrollments, totalInstructors, totalAdmins] =
      await Promise.all([
        this.adminService.getTotalStudents(),
        this.adminService.getTotalEnrollments(),
        this.adminService.getTotalInstructors(),
        this.adminService.getTotalAdmins(),
      ]);
    return {
      totalStudents,
      totalEnrollments,
      totalInstructors,
      totalAdmins,
    };
  }
}