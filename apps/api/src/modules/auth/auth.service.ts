import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

import { SupabaseService } from "../../config/supabase.service";

import { ActorType, BeginSignupDto } from "./dto/begin-signup.dto";
import { CompleteProfileDto } from "./dto/complete-profile.dto";
import { SyncProfileDto } from "./dto/sync-profile.dto";

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
      supportedMethods: ["email_password", "google", "magic_link"],
    };
  }

  async syncProfile(authorization: string | undefined, dto: SyncProfileDto) {
    const user = await this.getUserFromAuthorization(authorization);
    const actorType =
      dto.actorType ??
      (user.user_metadata?.actorType as ActorType | undefined) ??
      ActorType.PATIENT;

    const { data, error } = await this.supabaseService.adminClient
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name:
            user.user_metadata?.fullName ??
            user.user_metadata?.full_name ??
            user.email?.split("@")[0] ??
            null,
          email: user.email ?? null,
          phone: user.phone ?? null,
          account_type: actorType,
          onboarding_step: actorType === ActorType.PATIENT ? 2 : 1,
          status: "active",
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (dto.onboardingSessionId) {
      await this.supabaseService.adminClient
        .from("onboarding_sessions")
        .update({
          status: "active",
          current_step: actorType === ActorType.PATIENT ? 2 : 1,
        })
        .eq("id", dto.onboardingSessionId);
    }

    return data;
  }

  async completeProfile(authorization: string | undefined, dto: CompleteProfileDto) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("profiles")
      .update({
        full_name: dto.fullName ?? null,
        phone: dto.phone ?? null,
        preferred_city: dto.preferredCity ?? null,
        emergency_contact_name: dto.emergencyContactName ?? null,
        emergency_contact_phone: dto.emergencyContactPhone ?? null,
        onboarding_step: 3,
        status: "active",
      })
      .eq("id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  private async getUserFromAuthorization(authorization: string | undefined): Promise<User> {
    const token = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const { data, error } = await this.supabaseService.adminClient.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message ?? "Invalid session token.");
    }

    return data.user;
  }
}
