import { Injectable } from "@nestjs/common";
import { Course } from "src/courses/models/course.model";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum Role {
    ADMIN = "admin",
    INSTRUCTOR = "instructor",
    USER = "user"
}

@Entity()


export class User {
    @PrimaryGeneratedColumn()
        id: number
    @Column()
        name: string
    @Column({unique: true})
        email: string
    @Column()
        password: string

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER
    })
    role: Role

    @OneToMany(() => Course , course => course.user)
    course: Course[]
}