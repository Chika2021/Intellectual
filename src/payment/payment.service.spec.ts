import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { Course } from '../courses/models/course.model';
import { User } from '../user/model/user.model';
import { Enrollment } from './models/enrollment.model';
import { describe, jest, beforeEach, it, expect } from '@jest/globals';

const mockRepository = {}; 
const mockConfigService = { get: jest.fn() };

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Course), useValue: mockRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Enrollment), useValue: mockRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
