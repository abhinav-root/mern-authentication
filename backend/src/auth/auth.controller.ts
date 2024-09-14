import { Body, Controller, Get, Post } from '@nestjs/common';
import { SignupDto } from './dtos/signup.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Get('login')
  login() {
    return 'login';
  }

  @Get('logout')
  logout() {
    return 'logout';
  }
}
