import { Body, Controller, Headers, Post } from "@nestjs/common";

import { AuthService } from "./auth.service";
import { BeginSignupDto } from "./dto/begin-signup.dto";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { SyncProfileDto } from "./dto/sync-profile.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup/begin")
  beginSignup(@Body() dto: BeginSignupDto) {
    return this.authService.beginSignup(dto);
  }

  @Post("sync-profile")
  syncProfile(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: SyncProfileDto,
  ) {
    return this.authService.syncProfile(authorization, dto);
  }

  @Post("profile-completion")
  completeProfile(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: CompleteProfileDto,
  ) {
    return this.authService.completeProfile(authorization, dto);
  }
}
