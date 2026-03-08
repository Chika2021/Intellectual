import { Injectable } from "@nestjs/common";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Role } from "./user.model";

@Injectable()

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
        name: string

    @IsEmail()
    @IsNotEmpty()
        email: string

    @IsString()
    @IsNotEmpty()
        password: string

    @IsNotEmpty()
    @IsEnum(Role)
        role: Role
    
}