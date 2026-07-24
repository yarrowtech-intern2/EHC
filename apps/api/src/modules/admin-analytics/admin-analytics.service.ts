import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

import { getUserFromAuthorization } from "../../common/access-control";
import { SupabaseService } from "../../config/supabase.service";

type RoleRecord = {
  role: string;
  tenant_id: string | null;
  facility_id: string | null;
};

type TenantRecord = {
  id: string;
  display_name: string | null;
  category: string | null;
  status: string | null;
  created_at: string;
};

type FacilityRecord = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
  status: string | null;
  created_at: string;
};

type AuditLogRecord = {
  id: string;
  event_type: string;
  entity_type: string;
  tenant_id: string | null;
  facility_id: string | null;
  created_at: string;
};

type StatusRecord = {
  id: string;
  status: string;
  tenant_id?: string | null;
  facility_id?: string | null;
  created_at: string;
};

type AmbulanceUnitRecord = {
  id: string;
  tenant_id: string;
  facility_id: string;
  status: string;
  verification_status?: string | null;
  created_at: string;
};

type DriverApplicationRecord = {
  id: string;
  status: string;
  full_name: string;
  service_name: string;
  city: string;
  vehicle_number: string;
  created_at: string;
};

@Injectable()
export class AdminAnalyticsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOverview(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const roles = await this.getRoles(user.id);
    const isSuperAdmin = roles.some((role) => role.role === "super_admin");

    if (!isSuperAdmin && roles.length === 0) {
      throw new UnauthorizedException("Admin access is required.");
    }

    const tenantIds = Array.from(new Set(roles.map((role) => role.tenant_id).filter(Boolean) as string[]));
    const facilityIds = Array.from(new Set(roles.map((role) => role.facility_id).filter(Boolean) as string[]));

    if (!isSuperAdmin && tenantIds.length === 0 && facilityIds.length === 0) {
      return this.emptyOverview(false);
    }

    const [tenants, facilities, members, auditLogs, appointments, emergencyRequests, ambulanceUnits, applications] =
      await Promise.all([
        this.getTenants(isSuperAdmin, tenantIds),
        this.getFacilities(isSuperAdmin, tenantIds, facilityIds),
        this.getMembers(isSuperAdmin, tenantIds, facilityIds),
        this.getAuditLogs(isSuperAdmin, tenantIds, facilityIds),
        this.getOptionalStatusRecords("appointments", isSuperAdmin, tenantIds, facilityIds),
        this.getOptionalStatusRecords("emergency_ambulance_requests", isSuperAdmin, tenantIds, facilityIds),
        this.getAmbulanceUnits(isSuperAdmin, tenantIds, facilityIds),
        this.getDriverApplications(isSuperAdmin),
      ]);

    const pendingApplications = applications.filter((application) => application.status === "pending_verification");
    const activeEmergencyRequests = emergencyRequests.filter((request) =>
      ["requested", "accepted", "en_route", "arrived", "transporting"].includes(request.status),
    );
    const availableAmbulances = ambulanceUnits.filter(
      (unit) => unit.status === "available" && (unit.verification_status ?? "approved") === "approved",
    );

    return {
      scope: {
        global: isSuperAdmin,
        tenantIds,
        facilityIds,
      },
      metrics: {
        tenants: tenants.length,
        facilities: facilities.length,
        staff: members.length,
        auditEvents: auditLogs.length,
        appointments: appointments.length,
        pendingApprovals: isSuperAdmin ? pendingApplications.length : 0,
        activeAmbulanceRequests: activeEmergencyRequests.length,
        availableAmbulances: availableAmbulances.length,
      },
      charts: {
        facilityMix: this.countBy(facilities, "type"),
        roleDistribution: this.countBy(members, "role"),
        appointmentStatuses: this.countBy(appointments, "status"),
        emergencyRequestStatuses: this.countBy(emergencyRequests, "status"),
        auditEventsByDay: this.countByDay(auditLogs),
        ambulanceUnitStatuses: this.countBy(ambulanceUnits, "status"),
      },
      notifications: this.buildNotifications({
        isSuperAdmin,
        pendingApplications,
        activeEmergencyRequests,
        availableAmbulances,
        facilities,
      }),
      approvals: pendingApplications.slice(0, 5).map((application) => ({
        id: application.id,
        title: application.full_name,
        subtitle: `${application.service_name} - ${application.city}`,
        vehicleNumber: application.vehicle_number,
        createdAt: application.created_at,
        href: "/admin/ambulance-verification",
      })),
      recentAuditLogs: auditLogs.slice(0, 6).map((log) => ({
        id: log.id,
        eventType: log.event_type,
        entityType: log.entity_type,
        createdAt: log.created_at,
      })),
    };
  }

  private async getRoles(userId: string) {
    const { data, error } = await this.supabaseService.adminClient
      .from("user_roles")
      .select("role, tenant_id, facility_id")
      .eq("user_id", userId);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as RoleRecord[];
  }

  private async getTenants(isSuperAdmin: boolean, tenantIds: string[]) {
    let query = this.supabaseService.adminClient
      .from("tenants")
      .select("id, display_name, category, status, created_at")
      .order("created_at", { ascending: false });

    if (!isSuperAdmin) {
      query = query.in("id", tenantIds);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as TenantRecord[];
  }

  private async getFacilities(isSuperAdmin: boolean, tenantIds: string[], facilityIds: string[]) {
    let query = this.supabaseService.adminClient
      .from("facilities")
      .select("id, tenant_id, name, type, city, status, created_at")
      .order("created_at", { ascending: false });

    if (!isSuperAdmin) {
      if (facilityIds.length > 0) {
        query = query.in("id", facilityIds);
      } else {
        query = query.in("tenant_id", tenantIds);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as FacilityRecord[];
  }

  private async getMembers(isSuperAdmin: boolean, tenantIds: string[], facilityIds: string[]) {
    let query = this.supabaseService.adminClient
      .from("user_roles")
      .select("id, role, tenant_id, facility_id, created_at")
      .order("created_at", { ascending: false });

    if (!isSuperAdmin) {
      if (facilityIds.length > 0) {
        query = query.in("facility_id", facilityIds);
      } else {
        query = query.in("tenant_id", tenantIds);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ?? [];
  }

  private async getAuditLogs(isSuperAdmin: boolean, tenantIds: string[], facilityIds: string[]) {
    let query = this.supabaseService.adminClient
      .from("audit_logs")
      .select("id, event_type, entity_type, tenant_id, facility_id, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!isSuperAdmin) {
      if (facilityIds.length > 0) {
        query = query.in("facility_id", facilityIds);
      } else {
        query = query.in("tenant_id", tenantIds);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as AuditLogRecord[];
  }

  private async getOptionalStatusRecords(
    table: "appointments" | "emergency_ambulance_requests",
    isSuperAdmin: boolean,
    tenantIds: string[],
    facilityIds: string[],
  ) {
    const columns =
      table === "appointments"
        ? "id, status, facility_id, created_at"
        : "id, status, tenant_id, facility_id, created_at";

    let query = this.supabaseService.adminClient
      .from(table)
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!isSuperAdmin) {
      if (facilityIds.length > 0) {
        query = query.in("facility_id", facilityIds);
      } else if (table === "emergency_ambulance_requests") {
        query = query.in("tenant_id", tenantIds);
      } else {
        const facilities = await this.getFacilities(false, tenantIds, []);
        const ids = facilities.map((facility) => facility.id);
        if (ids.length === 0) {
          return [];
        }
        query = query.in("facility_id", ids);
      }
    }

    const { data, error } = await query;

    if (error && this.isMissingRelationError(error.message)) {
      return [];
    }

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return ((data ?? []) as unknown) as StatusRecord[];
  }

  private async getAmbulanceUnits(isSuperAdmin: boolean, tenantIds: string[], facilityIds: string[]) {
    let query = this.supabaseService.adminClient
      .from("ambulance_units")
      .select("id, tenant_id, facility_id, status, verification_status, created_at")
      .order("created_at", { ascending: false });

    if (!isSuperAdmin) {
      if (facilityIds.length > 0) {
        query = query.in("facility_id", facilityIds);
      } else {
        query = query.in("tenant_id", tenantIds);
      }
    }

    const { data, error } = await query;

    if (error && this.isMissingRelationError(error.message)) {
      return [];
    }

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as AmbulanceUnitRecord[];
  }

  private async getDriverApplications(isSuperAdmin: boolean) {
    if (!isSuperAdmin) {
      return [];
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .select("id, status, full_name, service_name, city, vehicle_number, created_at")
      .order("created_at", { ascending: false });

    if (error && this.isMissingRelationError(error.message)) {
      return [];
    }

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []) as DriverApplicationRecord[];
  }

  private buildNotifications({
    isSuperAdmin,
    pendingApplications,
    activeEmergencyRequests,
    availableAmbulances,
    facilities,
  }: {
    isSuperAdmin: boolean;
    pendingApplications: DriverApplicationRecord[];
    activeEmergencyRequests: StatusRecord[];
    availableAmbulances: AmbulanceUnitRecord[];
    facilities: FacilityRecord[];
  }) {
    const notifications = [];

    if (isSuperAdmin && pendingApplications.length > 0) {
      notifications.push({
        id: "pending-ambulance-approvals",
        tone: "warning",
        title: `${pendingApplications.length} ambulance driver approval${pendingApplications.length === 1 ? "" : "s"} pending`,
        description: "Review documents before these drivers can accept emergency requests.",
        href: "/admin/ambulance-verification",
      });
    }

    if (activeEmergencyRequests.length > 0) {
      notifications.push({
        id: "active-emergency-requests",
        tone: "critical",
        title: `${activeEmergencyRequests.length} active emergency request${activeEmergencyRequests.length === 1 ? "" : "s"}`,
        description: "Monitor pickup and trip status in ambulance operations.",
        href: "/admin/ambulance",
      });
    }

    if (facilities.some((facility) => facility.type === "ambulance_unit") && availableAmbulances.length === 0) {
      notifications.push({
        id: "no-available-ambulances",
        tone: "info",
        title: "No ambulances available",
        description: "Verified drivers need to share GPS and go available before dispatch.",
        href: "/admin/ambulance",
      });
    }

    return notifications;
  }

  private countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
    const counts = new Map<string, number>();

    for (const item of items) {
      const raw = item[key];
      const label = typeof raw === "string" && raw.trim() ? raw : "unknown";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label: this.formatLabel(label), value }))
      .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  }

  private countByDay(items: Array<{ created_at: string }>) {
    const counts = new Map<string, number>();
    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      counts.set(date.toISOString().slice(0, 10), 0);
    }

    for (const item of items) {
      const key = new Date(item.created_at).toISOString().slice(0, 10);
      if (counts.has(key)) {
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries()).map(([label, value]) => ({
      label: label.slice(5),
      value,
    }));
  }

  private emptyOverview(global: boolean) {
    return {
      scope: { global, tenantIds: [], facilityIds: [] },
      metrics: {
        tenants: 0,
        facilities: 0,
        staff: 0,
        auditEvents: 0,
        appointments: 0,
        pendingApprovals: 0,
        activeAmbulanceRequests: 0,
        availableAmbulances: 0,
      },
      charts: {
        facilityMix: [],
        roleDistribution: [],
        appointmentStatuses: [],
        emergencyRequestStatuses: [],
        auditEventsByDay: [],
        ambulanceUnitStatuses: [],
      },
      notifications: [],
      approvals: [],
      recentAuditLogs: [],
    };
  }

  private isMissingRelationError(message: string) {
    return message.includes("does not exist") || message.includes("schema cache");
  }

  private formatLabel(value: string) {
    return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
