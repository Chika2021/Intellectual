import { Injectable } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


@Injectable()

export class LoginDto {
    @IsNotEmpty()
    @IsString()
        name: string

    @IsNotEmpty()
    @IsEmail()
        email: string

    @IsNotEmpty()
    @IsString()
    @MinLength(5, {message: 'Password should not be less than 5'})
        password: string

}