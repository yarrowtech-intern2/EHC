import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

import {
  getAccessibleTenantIds,
  getUserFromAuthorization,
} from "../../common/access-control";
import { SupabaseService } from "../../config/supabase.service";

type AuditLogFilters = {
  tenantId?: string;
  facilityId?: string;
  actorUserId?: string;
  eventType?: string;
  entityType?: string;
  from?: string;
  to?: string;
  limit?: string;
};

type AuditLogRecordParams = {
  authorization?: string;
  tenantId?: string | null;
  facilityId?: string | null;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AuditLogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private readonly auditReaderRoles = [
    "tenant_admin",
    "pharmacy_admin",
    "ambulance_admin",
    "blood_bank_admin",
  ] as const;

  getTemplate() {
    return {
      eventTypes: [
        "tenant.created",
        "facility.created",
        "user.invited",
        "user.role_assigned",
        "auth.signup_started",
      ],
      rule: "All privileged actions must be written to an immutable audit stream.",
    };
  }

  async getLogs(authorization: string | undefined, filters: AuditLogFilters) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const accessibleTenantIds = await getAccessibleTenantIds(
      this.supabaseService,
      user.id,
      [...this.auditReaderRoles],
    );

    if (accessibleTenantIds.length === 0) {
      return [];
    }

    if (filters.tenantId && !accessibleTenantIds.includes(filters.tenantId)) {
      throw new UnauthorizedException("You do not have access to this tenant.");
    }

    let query = this.supabaseService.adminClient
      .from("audit_logs")
      .select(
        "id, tenant_id, facility_id, actor_user_id, event_type, entity_type, entity_id, metadata, created_at, tenants(display_name), facilities(name)",
      )
      .order("created_at", { ascending: false })
      .limit(this.parseLimit(filters.limit));

    if (filters.tenantId) {
      query = query.eq("tenant_id", filters.tenantId);
    } else {
      query = query.in("tenant_id", accessibleTenantIds);
    }

    if (filters.facilityId) {
      query = query.eq("facility_id", filters.facilityId);
    }

    if (filters.actorUserId) {
      query = query.eq("actor_user_id", filters.actorUserId);
    }

    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }

    if (filters.entityType) {
      query = query.eq("entity_type", filters.entityType);
    }

    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const actorIds = Array.from(
      new Set(data.map((entry) => entry.actor_user_id).filter(Boolean) as string[]),
    );

    const profileById = await this.getProfileMap(actorIds);

    return data.map((entry) => ({
      id: entry.id,
      tenant_id: entry.tenant_id,
      facility_id: entry.facility_id,
      actor_user_id: entry.actor_user_id,
      event_type: entry.event_type,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      metadata: entry.metadata ?? {},
      created_at: entry.created_at,
      tenant_name: Array.isArray(entry.tenants)
        ? entry.tenants[0]?.display_name ?? null
        : (entry.tenants as { display_name?: string } | null)?.display_name ?? null,
      facility_name: Array.isArray(entry.facilities)
        ? entry.facilities[0]?.name ?? null
        : (entry.facilities as { name?: string } | null)?.name ?? null,
      actor_name: entry.actor_user_id ? profileById.get(entry.actor_user_id)?.full_name ?? null : null,
      actor_email: entry.actor_user_id ? profileById.get(entry.actor_user_id)?.email ?? null : null,
    }));
  }

  async recordEvent({
    authorization,
    tenantId,
    facilityId,
    eventType,
    entityType,
    entityId,
    metadata,
  }: AuditLogRecordParams) {
    const actor = authorization
      ? await this.getOptionalUserFromAuthorization(authorization)
      : null;

    const actorMetadata = actor
      ? {
          actorEmail: actor.email ?? null,
          actorName:
            typeof actor.user_metadata?.full_name === "string"
              ? actor.user_metadata.full_name
              : null,
        }
      : {};

    const { error } = await this.supabaseService.adminClient.from("audit_logs").insert({
      tenant_id: tenantId ?? null,
      facility_id: facilityId ?? null,
      actor_user_id: actor?.id ?? null,
      event_type: eventType,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: {
        ...(metadata ?? {}),
        ...actorMetadata,
      },
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private parseLimit(limit?: string) {
    const parsed = Number(limit ?? "50");

    if (!Number.isFinite(parsed) || parsed < 1) {
      return 50;
    }

    return Math.min(parsed, 200);
  }

  private async getProfileMap(userIds: string[]) {
    if (userIds.length === 0) {
      return new Map<string, { full_name: string | null; email: string | null }>();
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return new Map(
      data.map((profile) => [
        profile.id,
        {
          full_name: profile.full_name ?? null,
          email: profile.email ?? null,
        },
      ]),
    );
  }

  private async getOptionalUserFromAuthorization(
    authorization: string | undefined,
  ): Promise<User | null> {
    const token = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return null;
    }

    const { data, error } = await this.supabaseService.adminClient.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }
}
