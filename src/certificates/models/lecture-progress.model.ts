// src/certificates/models/lecture-progress.model.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from 'src/user/model/user.model';
import { Lectures } from 'src/lectures/model/lectures.model';

@Entity('lecture_progress')
export class LectureProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  student: User;

  @ManyToOne(() => Lectures)
  lecture: Lectures;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  completedAt: Date;
}