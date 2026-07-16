import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";

import { CreateFacilityDto } from "./dto/create-facility.dto";

@Injectable()
export class FacilitiesService {
  constructor(private readonly supabaseService: SupabaseService) {}

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

  async createFacility(dto: CreateFacilityDto) {
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

    return {
      status: "draft_created",
      facility: data,
    };
  }
}
