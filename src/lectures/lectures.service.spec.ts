import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LecturesService } from './lectures.service';
import { Lectures } from './model/lectures.model';
import { Course } from '../courses/models/course.model';

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('LecturesService', () => {
  let service: LecturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturesService,
        { provide: getRepositoryToken(Lectures), useValue: mockRepository },
        { provide: getRepositoryToken(Course), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<LecturesService>(LecturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
