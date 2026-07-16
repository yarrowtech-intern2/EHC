import { Injectable, InternalServerErrorException } from "@nestjs/common";

import { SupabaseService } from "../../config/supabase.service";
import { CreateAppointmentSlotDto } from "./dto/create-appointment-slot.dto";

@Injectable()
export class AppointmentSlotsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getPublicSlots(facilityId: string, date?: string) {
    let query = this.supabaseService.adminClient
      .from("appointment_slots")
      .select(
        "id, facility_id, doctor_user_id, slot_date, start_time, end_time, service_type, capacity, booked_count, status",
      )
      .eq("facility_id", facilityId)
      .eq("status", "available")
      .order("slot_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (date) {
      query = query.eq("slot_date", date);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async createSlot(dto: CreateAppointmentSlotDto) {
    const { data, error } = await this.supabaseService.adminClient
      .from("appointment_slots")
      .insert({
        facility_id: dto.facilityId,
        doctor_user_id: dto.doctorUserId ?? null,
        slot_date: dto.slotDate,
        start_time: dto.startTime,
        end_time: dto.endTime,
        service_type: dto.serviceType,
        capacity: dto.capacity ?? 1,
        booked_count: 0,
        status: "available",
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }
}
