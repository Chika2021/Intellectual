import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class InitiatePaymentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  courseId: number;

  @IsOptional()
  @IsString()
  callback_url?: string;
}