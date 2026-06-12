import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCertificateRequestDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  graduationDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}

export class UpdateCertificateRequestDto {
  @IsOptional()
  status?: string; // 'approved' or 'rejected'

  @IsOptional()
  @IsString()
  adminNotes?: string;
}