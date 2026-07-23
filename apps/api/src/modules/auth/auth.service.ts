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
    const userMetadata = user.user_metadata ?? {};

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
          age:
            dto.age ??
            (typeof userMetadata.age === "number" ? userMetadata.age : null),
          blood_group:
            dto.bloodGroup ??
            (typeof userMetadata.bloodGroup === "string"
              ? userMetadata.bloodGroup
              : null),
          location:
            dto.location ??
            (typeof userMetadata.location === "string"
              ? userMetadata.location
              : null),
          preferred_city:
            dto.location ??
            (typeof userMetadata.location === "string"
              ? userMetadata.location
              : null),
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
        age: dto.age ?? null,
        blood_group: dto.bloodGroup ?? null,
        location: dto.location ?? dto.preferredCity ?? null,
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

  async getSessionContext(authorization: string | undefined) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data: profile, error: profileError } = await this.supabaseService.adminClient
      .from("profiles")
      .select(
        "id, tenant_id, facility_id, full_name, email, phone, account_type, age, blood_group, location, preferred_city, emergency_contact_name, emergency_contact_phone",
      )
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    const { data: roles, error: rolesError } = await this.supabaseService.adminClient
      .from("user_roles")
      .select(
        "id, role, tenant_id, facility_id, tenants(display_name), facilities(name, type, city)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (rolesError) {
      throw new InternalServerErrorException(rolesError.message);
    }

    return {
      profile,
      roles: roles.map((item) => ({
        id: item.id,
        role: item.role,
        tenant_id: item.tenant_id,
        facility_id: item.facility_id,
        tenant_name: Array.isArray(item.tenants)
          ? item.tenants[0]?.display_name ?? null
          : (item.tenants as any)?.display_name ?? null,
        facility_name: Array.isArray(item.facilities)
          ? item.facilities[0]?.name ?? null
          : (item.facilities as any)?.name ?? null,
        facility_type: Array.isArray(item.facilities)
          ? item.facilities[0]?.type ?? null
          : (item.facilities as any)?.type ?? null,
        facility_city: Array.isArray(item.facilities)
          ? item.facilities[0]?.city ?? null
          : (item.facilities as any)?.city ?? null,
      })),
    };
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
