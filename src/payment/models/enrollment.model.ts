import { User } from 'src/user/model/user.model';
import { Course } from 'src/courses/models/course.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum EnrollmentStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
}

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  reference!: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status!: EnrollmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid!: number;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @ManyToOne(() => Course, { eager: true })
  course!: Course;

  @CreateDateColumn()
  createdAt!: Date;
}