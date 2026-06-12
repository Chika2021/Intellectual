import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from '../user/model/user.model';

@Injectable()
export class SeedAdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seedAdmin() {
    // Check if admin already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { role: Role.ADMIN },
    });

    if (existingAdmin) {
      throw new ConflictException('Admin user already exists');
    }

    const hashedPassword = await bcrypt.hash('Admin123', 10);

    const admin = this.userRepository.create({
      name: 'Robernix',
      email: 'admin@robernixindustries.com',
      password: hashedPassword,
      role: Role.ADMIN,
    });

    await this.userRepository.save(admin);

    return {
      message: 'Admin user created successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}