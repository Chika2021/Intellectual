import { Lectures } from "src/lectures/model/lectures.model";
import { User } from "src/user/model/user.model";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Course {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'text' })
    image: string

    @Column()
    name: string

    @Column({ type: 'text' })
    description: string

    @Column()
    price: number

    @Column({ type: 'text' })
    topics: string

    // When the user (instructor) is deleted, their courses are deleted too
    @ManyToOne(() => User, user => user.course, { onDelete: 'CASCADE' })
    user: User

    // When a course is deleted, all its lectures are deleted too
    @OneToMany(() => Lectures, lectures => lectures.course, { cascade: true, onDelete: 'CASCADE' })
    lectures: Lectures[]
}