import { Test, TestingModule } from '@nestjs/testing';
import { LecturesController } from './lectures.controller';
import { LecturesService } from './lectures.service';

describe('LecturesController', () => {
  let controller: LecturesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturesController],
      providers: [{ provide: LecturesService, useValue: {} }],
    }).compile();

    controller = module.get<LecturesController>(LecturesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
