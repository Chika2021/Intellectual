import { User } from 'src/user/model/user.model';
import { Course } from 'src/courses/models/course.model';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CertificateStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('certificate_requests')
export class CertificateRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  student!: User;

  @ManyToOne(() => Course, { eager: true })
  course!: Course;

  // Additional form fields
  @Column()
  fullName: string; // name as it should appear on certificate

  @Column({ nullable: true })
  studentId?: string; // optional student ID

  @Column({ nullable: true })
  graduationDate?: string; // date of completion

  @Column({ type: 'text', nullable: true })
  message?: string; // any additional note

  @Column({ type: 'enum', enum: CertificateStatus, default: CertificateStatus.PENDING })
  status!: CertificateStatus;

  @Column({ nullable: true })
  adminNotes?: string; // feedback from admin

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}