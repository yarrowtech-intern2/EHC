import { Body, Controller, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { BeginSignupDto } from "./dto/begin-signup.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup/begin")
  beginSignup(@Body() dto: BeginSignupDto) {
    return this.authService.beginSignup(dto);
  }
}

