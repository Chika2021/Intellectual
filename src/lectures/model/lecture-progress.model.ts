import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '../../user/model/user.model';
import { Lectures } from './lectures.model';

@Entity('lecture_progress')
export class LectureProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  student: User;

  @ManyToOne(() => Lectures, { eager: true })
  lecture: Lectures;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  completedAt: Date;
}