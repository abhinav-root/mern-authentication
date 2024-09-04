import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('signup')
  signup() {
    return 'signup';
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
