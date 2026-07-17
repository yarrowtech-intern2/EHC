import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";

import { CreateFacilityDto } from "./dto/create-facility.dto";

@Injectable()
export class FacilitiesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  getFacilityTypes() {
    return [
      "hospital",
      "clinic",
      "pharmacy",
      "lab",
      "ambulance_unit",
      "independent_vendor",
    ];
  }

  async getPublicFacilities() {
    const { data, error } = await this.supabaseService.adminClient
      .from("facilities")
      .select("id, tenant_id, name, type, city")
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async getPublicFacilityById(id: string) {
    const { data, error } = await this.supabaseService.adminClient
      .from("facilities")
      .select("id, tenant_id, name, type, city, contact_number, serves_patients_directly")
      .eq("id", id)
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      throw new NotFoundException("Facility not found.");
    }

    return data;
  }

  async createFacility(dto: CreateFacilityDto, authorization?: string) {
    const { data, error } = await this.supabaseService.adminClient
      .from("facilities")
      .insert({
        tenant_id: dto.tenantId,
        name: dto.name,
        type: dto.type,
        contact_number: dto.contactNumber ?? null,
        city: dto.city ?? null,
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: data.tenant_id,
      facilityId: data.id,
      eventType: "facility.created",
      entityType: "facility",
      entityId: data.id,
      metadata: {
        name: data.name,
        type: data.type,
        city: data.city,
        status: data.status,
      },
    });

    return {
      status: "draft_created",
      facility: data,
    };
  }
}
