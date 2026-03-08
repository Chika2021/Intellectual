import { Injectable } from "@nestjs/common";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


@Injectable()

export class UpdateCourseDto {

    @IsString()
    @IsOptional()
        name: string

    @IsString()
    @IsOptional()
        description: string

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
        price: number

    @IsString()
    @IsOptional()
        topics: string

}