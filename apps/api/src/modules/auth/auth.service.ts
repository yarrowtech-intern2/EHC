import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";

import { BeginSignupDto } from "./dto/begin-signup.dto";

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async beginSignup(dto: BeginSignupDto) {
    const { data, error } = await this.supabaseService.adminClient
      .from("onboarding_sessions")
      .insert({
        actor_type: dto.actorType,
        signup_method: dto.signupMethod,
        email: dto.email ?? null,
        phone: dto.phone ?? null,
        organization_name: dto.organizationName ?? null,
        full_name: dto.fullName ?? null,
        current_step: 1,
      })
      .select("id, actor_type, signup_method, email, phone, organization_name, full_name, current_step, status, created_at")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      message: "Signup flow initialized",
      nextStep: "verify_identity",
      session: data,
      supportedMethods: ["email_password", "google", "magic_link", "phone_otp"],
    };
  }
}
