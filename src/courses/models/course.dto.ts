import { Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";


@Injectable()

export class CourseDto {

    @IsString()
    @IsNotEmpty()
        image: string

    @IsString()
    @IsNotEmpty()
        name: string

    @IsString()
    @IsNotEmpty()
        description: string

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
        price: number

    @IsString()
    @IsNotEmpty()
        topics: string

}