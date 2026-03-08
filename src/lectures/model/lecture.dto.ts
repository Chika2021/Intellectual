import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";


@Injectable()

export class LectureDto {
    
    @IsNotEmpty()
    @IsString()
        title: string

    @IsNotEmpty()
    @IsString()
        tutorial: string
        
    @IsString()
    @IsNotEmpty()
        materials: string

    @IsString()
    @IsOptional()
        exam: string
}