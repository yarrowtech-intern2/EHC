import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

import { SupabaseService } from "../../config/supabase.service";
import { CreateAppointmentRequestDto } from "./dto/create-appointment-request.dto";

@Injectable()
export class AppointmentRequestsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createAppointmentRequest(
    authorization: string | undefined,
    dto: CreateAppointmentRequestDto,
  ) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("appointment_requests")
      .insert({
        patient_user_id: user.id,
        facility_id: dto.facilityId,
        service_type: dto.serviceType,
        preferred_date: dto.preferredDate,
        preferred_time: dto.preferredTime,
        reason: dto.reason,
        notes: dto.notes ?? null,
        status: "submitted",
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      message: "Booking request submitted",
      appointmentRequest: data,
    };
  }

  private async getUserFromAuthorization(
    authorization: string | undefined,
  ): Promise<User> {
    const token = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      throw new UnauthorizedException("Missing bearer token.");
    }

    const { data, error } = await this.supabaseService.adminClient.auth.getUser(
      token,
    );

    if (error || !data.user) {
      throw new UnauthorizedException(error?.message ?? "Invalid session token.");
    }

    return data.user;
  }
}

