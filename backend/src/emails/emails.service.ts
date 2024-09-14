import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class EmailsService {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const SENDER_EMAIL = this.configService.get<string>('EMAIL');
    const SENDER_EMAIL_PASSWORD =
      this.configService.get<string>('EMAIL_PASSWORD');

    const transporter = nodemailer.createTransport({
      service: 'gmail', // For example, use 'gmail' or any other service you prefer
      auth: {
        user: SENDER_EMAIL, // Your email address
        pass: SENDER_EMAIL_PASSWORD, // Your email password or an application-specific password
      },
    });

    const mailOptions = {
      from: SENDER_EMAIL, // Sender address
      to: to, // List of receivers
      subject: subject, // Subject line
      text: text, // Plain text body
      html: html, // HTML body (optional)
    };

    const response = await transporter.sendMail(mailOptions);
    return response;
  }

  async sendVerificationEmail(
    recepientEmail: string,
    verificationCode: string,
  ) {
    const subject = 'Verify your email';
    const text = `Your emai verification code is ${verificationCode}.`;
    await this.sendEmail(recepientEmail, subject, text);
  }

  async sendWelcomeEmail(recepientEmail: string, userName: string) {
    const subject = 'Verify your email';
    const text = `Welcome ${userName}. You have successfully verified your email.`;
    await this.sendEmail(recepientEmail, subject, text);
  }

  async sendResetPasswordEmail(
    recepientEmail: string,
    resetPasswordToken: string,
  ) {
    const CLIENT_URL = this.configService.get<string>('CLIENT_URL');
    if (!CLIENT_URL) {
      throw new Error('CLIENT_URL is not defined');
    }

    const resetPasswordLink = `${CLIENT_URL}/reset-password?token=${resetPasswordToken}`;
    console.log({ resetPasswordLink });
    const subject = 'Reset Password Link';
    const text = `Click on below link to reset your password.\n${resetPasswordLink}`;
    await this.sendEmail(recepientEmail, subject, text);
  }
}
