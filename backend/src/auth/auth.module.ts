import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports: [UsersModule, EmailsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
