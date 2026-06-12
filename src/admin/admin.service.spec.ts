import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { User } from '../user/model/user.model';
import { Course } from '../courses/models/course.model';
import { Lectures } from '../lectures/model/lectures.model';
import { Enrollment } from '../payment/models/enrollment.model';

describe('AdminService', () => {
  let service: AdminService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Course), useValue: mockRepository },
        { provide: getRepositoryToken(Lectures), useValue: mockRepository },
        { provide: getRepositoryToken(Enrollment), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
