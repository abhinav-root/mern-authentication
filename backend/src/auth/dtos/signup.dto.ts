import { IsEmail, IsString, Length } from 'class-validator';

export class SignupDto {
  @Length(3, 50)
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;
}
