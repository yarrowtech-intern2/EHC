import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";

import { CreateTenantDto } from "./dto/create-tenant.dto";

@Injectable()
export class TenantsService {
  constructor(private readonly supabaseService: SupabaseService) {}

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

  async createTenant(dto: CreateTenantDto) {
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

    return {
      status: "draft_created",
      tenant: data,
    };
  }
}
