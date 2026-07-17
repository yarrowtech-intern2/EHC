import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AssignUserRoleDto } from "./dto/assign-user-role.dto";

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  getBaseRoles() {
    return [
      "super_admin",
      "tenant_admin",
      "doctor",
      "patient",
      "pharmacy_admin",
      "ambulance_admin",
      "blood_bank_admin",
    ];
  }

  async getMembers(tenantId?: string, facilityId?: string) {
    let query = this.supabaseService.adminClient
      .from("user_roles")
      .select(
        "id, user_id, tenant_id, facility_id, role, created_at, profiles(full_name, email, phone), tenants(display_name), facilities(name)",
      )
      .order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    if (facilityId) {
      query = query.eq("facility_id", facilityId);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      tenant_id: item.tenant_id,
      facility_id: item.facility_id,
      role: item.role,
      created_at: item.created_at,
      full_name: Array.isArray(item.profiles)
        ? item.profiles[0]?.full_name ?? null
        : (item.profiles as any)?.full_name ?? null,
      email: Array.isArray(item.profiles)
        ? item.profiles[0]?.email ?? null
        : (item.profiles as any)?.email ?? null,
      phone: Array.isArray(item.profiles)
        ? item.profiles[0]?.phone ?? null
        : (item.profiles as any)?.phone ?? null,
      tenant_name: Array.isArray(item.tenants)
        ? item.tenants[0]?.display_name ?? null
        : (item.tenants as any)?.display_name ?? null,
      facility_name: Array.isArray(item.facilities)
        ? item.facilities[0]?.name ?? null
        : (item.facilities as any)?.name ?? null,
    }));
  }

  async getDoctors() {
    const { data, error } = await this.supabaseService.adminClient
      .from("user_roles")
      .select("user_id, profiles(full_name, email, phone)")
      .eq("role", "doctor");

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data.map((item) => ({
      id: item.user_id,
      full_name: Array.isArray(item.profiles) ? item.profiles[0]?.full_name ?? null : (item.profiles as any)?.full_name ?? null,
      email: Array.isArray(item.profiles) ? item.profiles[0]?.email ?? null : (item.profiles as any)?.email ?? null,
      phone: Array.isArray(item.profiles) ? item.profiles[0]?.phone ?? null : (item.profiles as any)?.phone ?? null,
    }));
  }

  async assignRole(dto: AssignUserRoleDto, authorization?: string) {
    const normalizedEmail = dto.email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException("Email is required.");
    }

    const { data: profile, error: profileError } = await this.supabaseService.adminClient
      .from("profiles")
      .select("id, tenant_id, facility_id, email")
      .ilike("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    if (!profile) {
      throw new NotFoundException("No registered user profile found for this email.");
    }

    const { data: roleRecord, error: roleError } = await this.supabaseService.adminClient
      .from("user_roles")
      .insert({
        user_id: profile.id,
        tenant_id: dto.tenantId,
        facility_id: dto.facilityId ?? null,
        role: dto.role,
      })
      .select("*")
      .single();

    if (roleError) {
      throw new InternalServerErrorException(roleError.message);
    }

    const { error: profileUpdateError } = await this.supabaseService.adminClient
      .from("profiles")
      .update({
        tenant_id: dto.tenantId,
        facility_id: dto.facilityId ?? null,
      })
      .eq("id", profile.id);

    if (profileUpdateError) {
      throw new InternalServerErrorException(profileUpdateError.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: dto.tenantId,
      facilityId: dto.facilityId ?? null,
      eventType: "user.role_assigned",
      entityType: "user_role",
      entityId: roleRecord.id,
      metadata: {
        assignedUserId: profile.id,
        assignedEmail: normalizedEmail,
        role: dto.role,
      },
    });

    return {
      message: "Role assigned successfully.",
      role: roleRecord,
    };
  }
}
