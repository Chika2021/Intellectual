import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

const mockAdminService = {
  getAllUsers: jest.fn(),
  getAllCourses: jest.fn(),
  getAllLectures: jest.fn(),
  getPurchasesOverview: jest.fn(),
  getTotalStudents: jest.fn(),
  getTotalEnrollments: jest.fn(),
  getTotalInstructors: jest.fn(),
  getTotalAdmins: jest.fn(),
};

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: AdminService, useValue: mockAdminService }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
