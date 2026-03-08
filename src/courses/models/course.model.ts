import { Lectures } from "src/lectures/model/lectures.model";
import { User } from "src/user/model/user.model";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()

export class Course {
    
    @PrimaryGeneratedColumn()
        id: number

    @Column()
        image: string

    @Column()
        name: string

    @Column()
        description: string

    @Column()
        price: number

    @Column()
        topics: string

    @ManyToOne(() => User , user => user.course)
        user: User

    @OneToMany(() => Lectures, lectures => lectures.course)
        lectures: Lectures[]


    
}