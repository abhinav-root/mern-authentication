import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

import { SignupDto } from './dtos/signup.dto';
import { UsersService } from 'src/users/users.service';
import { EmailsService } from 'src/emails/emails.service';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailsService: EmailsService,
    private readonly configService: ConfigService,
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

    await this.emailsService.sendVerificationEmail(
      createdUser.email,
      verificationCode,
    );

    return {
      message: `Verification code sent to ${createdUser.email}`,
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

  async verifyEmail({ email, verificationCode }: VerifyEmailDto) {
    const user = await this.usersService.findUser({
      email,
      verificationCode,
      verificationCodeExpiresAt: { $gte: new Date() },
      isVerified: false,
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired code');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await user.save();

    await this.emailsService.sendWelcomeEmail(user.email, user.name);
    return { message: 'Email verified successfully' };
  }

  generateToken(userId: string) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId }, secret, { expiresIn: '1d' });
    return token;
  }

  async login(loginDto: LoginDto, response: Response) {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordCorrect = await this.verifyPassword(
      user.password,
      loginDto.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user.id);
    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return { message: 'Logged in' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findUserByEmail(
      forgotPasswordDto.email,
    );

    if (user) {
      const token = crypto.randomBytes(64).toString('base64url');
      user.resetPasswordToken = token;
      user.resetPasswordTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60);
      await user.save();
      await this.emailsService.sendResetPasswordEmail(user.email, token);
    }

    return {
      message: `A password reset link has been sent to ${forgotPasswordDto.email}`,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findUserByResetPasswordToken(
      resetPasswordDto.resetPasswordToken,
    );
    if (!user || (user.resetPasswordTokenExpiresAt as Date) < new Date()) {
      throw new BadRequestException(
        'Password reset link is invalid or has expired.',
      );
    }

    const hashedPassword = await this.hashPassword(
      resetPasswordDto.newPassword,
    );
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpiresAt = null;
    await user.save();
    await this.emailsService.sendPasswordChangedEmail(user.email);

    return { message: 'Password changed successfully' };
  }
}
