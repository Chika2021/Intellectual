import { Controller, Post, Headers, BadRequestException } from '@nestjs/common';
import { SeedAdminService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedAdminService: SeedAdminService) {}

  @Post('admin')
  async seedAdmin(@Headers('admin-secret') secret: string) {
    const expectedSecret = process.env.JWT_SECRET; // Use the same secret as JWT for seeding
    if (!expectedSecret || secret !== expectedSecret) {
      throw new BadRequestException('Invalid or missing admin secret');
    }
    return this.seedAdminService.seedAdmin();
  }
}