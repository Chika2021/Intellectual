// src/certificates/models/course-completion.model.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from 'src/user/model/user.model';
import { Course } from 'src/courses/models/course.model';

@Entity('course_completions')
export class CourseCompletion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Course)
  course: Course;

  @Column({ nullable: true })
  certificateUrl: string; // URL to generated PDF

  @CreateDateColumn()
  completedAt: Date;
}