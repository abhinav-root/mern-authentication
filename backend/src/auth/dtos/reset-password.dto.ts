import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(8, 100)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  resetPasswordToken: string;
}
