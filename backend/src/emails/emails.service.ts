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
}
