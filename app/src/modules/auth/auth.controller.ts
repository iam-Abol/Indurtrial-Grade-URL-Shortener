import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body) {
    return this.authService.signup(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body.email, body.password);
  }
}
