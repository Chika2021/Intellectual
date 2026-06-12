import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../user/model/user.model';

import { SeedController } from './seed.controller';
import { SeedAdminService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), ConfigModule],
  providers: [SeedAdminService],
  controllers: [SeedController],
})
export class SeedModule {}