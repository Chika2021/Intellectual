import { Course } from "src/courses/models/course.model";
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class Lectures {

    @PrimaryGeneratedColumn()
        id: number

    @Column()
        title: string

    @Column()
        tutorial: string

    @Column()
        materials: string

    @Column({nullable: true, default: null})
        exam: string

    @ManyToOne(() => Course , course => course.lectures)
        course: Course
}