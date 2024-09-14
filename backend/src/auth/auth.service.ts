import { ConflictException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';

import { SignupDto } from './dtos/signup.dto';
import { UsersService } from 'src/users/users.service';
import { EmailsService } from 'src/emails/emails.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
  ) {}

  async signup(signupDto: SignupDto) {
    const user = await this.usersService.findUserByEmail(signupDto.email);
    if (user) {
      throw new ConflictException('This email is already taken');
    }
    const hashedPassword = await this.hashPassword(signupDto.password);
    const verificationCode = this.getVerificationCode();
    const verificationCodeExpiresAt = new Date(Date.now() + 1000 * 60 * 60);

    const createdUser = await this.usersService.createUser({
      email: signupDto.email,
      password: hashedPassword,
      name: signupDto.name,
      verificationCode,
      verificationCodeExpiresAt,
    });

    await this.sendVerificationEmail(createdUser.email, verificationCode);

    return {
      message: `Verification email sent to ${createdUser.email}`,
    };
  }

  getVerificationCode(): string {
    // Define the range for 6-digit numbers
    const MIN = 100000;
    const MAX = 999999;

    // Generate a random integer between MIN (inclusive) and MAX (inclusive)
    const code = crypto.randomInt(MIN, MAX + 1);
    return String(code);
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async verifyPassword(
    hashedPassword: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(hashedPassword, password);
  }

  async sendVerificationEmail(
    recepientEmail: string,
    verificationCode: string,
  ) {
    const subject = 'Verify your email';
    const text = `Your emai verification code is ${verificationCode}`;
    const response = await this.emailsService.sendEmail(
      recepientEmail,
      subject,
      text,
    );
    console.log({ response });
  }
}
