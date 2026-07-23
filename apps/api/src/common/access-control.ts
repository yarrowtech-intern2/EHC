import {
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

import { SupabaseService } from "../config/supabase.service";

export type AppRole =
  | "super_admin"
  | "tenant_admin"
  | "facility_operator"
  | "doctor"
  | "patient"
  | "pharmacy_admin"
  | "ambulance_admin"
  | "blood_bank_admin";

export type FacilityAccess = {
  id: string;
  tenant_id: string;
  name?: string | null;
};

export async function getUserFromAuthorization(
  supabaseService: SupabaseService,
  authorization: string | undefined,
): Promise<User> {
  const token = authorization?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new UnauthorizedException("Missing bearer token.");
  }

  const { data, error } = await supabaseService.adminClient.auth.getUser(token);

  if (error || !data.user) {
    throw new UnauthorizedException(error?.message ?? "Invalid session token.");
  }

  return data.user;
}

export async function getAccessibleTenantIds(
  supabaseService: SupabaseService,
  userId: string,
  allowedRoles?: AppRole[],
) {
  let query = supabaseService.adminClient
    .from("user_roles")
    .select("tenant_id")
    .eq("user_id", userId)
    .not("tenant_id", "is", null);

  if (allowedRoles?.length) {
    query = query.in("role", allowedRoles);
  }

  const { data, error } = await query;

  if (error) {
    throw new InternalServerErrorException(error.message);
  }

  return Array.from(
    new Set(data.map((entry) => entry.tenant_id).filter(Boolean) as string[]),
  );
}

export async function assertTenantAccess(
  supabaseService: SupabaseService,
  userId: string,
  tenantId: string,
  allowedRoles?: AppRole[],
) {
  let query = supabaseService.adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("tenant_id", tenantId)
    .limit(1);

  if (allowedRoles?.length) {
    query = query.in("role", allowedRoles);
  }

  const { data, error } = await query;

  if (error) {
    throw new InternalServerErrorException(error.message);
  }

  if (!data.length) {
    const { data: profile, error: profileError } = await supabaseService.adminClient
      .from("profiles")
      .select("tenant_id, account_type")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    const profileRole = profile?.account_type as AppRole | null | undefined;
    const profileHasAccess =
      profile?.tenant_id === tenantId &&
      (!allowedRoles?.length || Boolean(profileRole && allowedRoles.includes(profileRole)));

    if (!profileHasAccess) {
      throw new UnauthorizedException("You do not have access to this tenant.");
    }
  }
}

export async function assertFacilityAccess(
  supabaseService: SupabaseService,
  userId: string,
  facilityId: string,
  allowedRoles?: AppRole[],
): Promise<FacilityAccess> {
  const { data: facility, error } = await supabaseService.adminClient
    .from("facilities")
    .select("id, tenant_id, name")
    .eq("id", facilityId)
    .single();

  if (error) {
    throw new InternalServerErrorException(error.message);
  }

  let roleQuery = supabaseService.adminClient
    .from("user_roles")
    .select("id, facility_id, role")
    .eq("user_id", userId)
    .eq("tenant_id", facility.tenant_id);

  if (allowedRoles?.length) {
    roleQuery = roleQuery.in("role", allowedRoles);
  }

  const { data: roles, error: rolesError } = await roleQuery;

  if (rolesError) {
    throw new InternalServerErrorException(rolesError.message);
  }

  const roleHasAccess = roles.some(
    (role) => role.facility_id === null || role.facility_id === facilityId,
  );

  if (!roleHasAccess) {
    const { data: profile, error: profileError } = await supabaseService.adminClient
      .from("profiles")
      .select("tenant_id, facility_id, account_type")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    const profileRole = profile?.account_type as AppRole | null | undefined;
    const profileHasAccess =
      Boolean(profile) &&
      profile?.tenant_id === facility.tenant_id &&
      (profile?.facility_id === null || profile?.facility_id === facilityId) &&
      (!allowedRoles?.length || Boolean(profileRole && allowedRoles.includes(profileRole)));

    if (!profileHasAccess) {
      throw new UnauthorizedException("You do not have access to this facility.");
    }
  }

  return facility;
}
