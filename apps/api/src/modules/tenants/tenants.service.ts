import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

import { CreateTenantDto } from "./dto/create-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  getTenantTemplate() {
    return {
      entity: "healthcare_organization",
      supportedFacilityTypes: [
        "hospital",
        "clinic",
        "pharmacy",
        "lab",
        "ambulance_unit",
        "independent_vendor",
      ],
    };
  }

  async getPublicTenants() {
    const { data, error } = await this.supabaseService.adminClient
      .from("tenants")
      .select("id, legal_name, display_name, category, country_code, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async createTenant(dto: CreateTenantDto, authorization?: string) {
    const { data, error } = await this.supabaseService.adminClient
      .from("tenants")
      .insert({
        legal_name: dto.legalName,
        display_name: dto.displayName,
        category: dto.category,
        country_code: dto.countryCode ?? null,
        allows_patient_self_service: dto.allowsPatientSelfService ?? true,
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: data.id,
      eventType: "tenant.created",
      entityType: "tenant",
      entityId: data.id,
      metadata: {
        displayName: data.display_name,
        category: data.category,
        status: data.status,
      },
    });

    return {
      status: "draft_created",
      tenant: data,
    };
  }
}
