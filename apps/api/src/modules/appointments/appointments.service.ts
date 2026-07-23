import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import type { User } from "@supabase/supabase-js";

import { assertFacilityAccess } from "../../common/access-control";
import { SupabaseService } from "../../config/supabase.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateConsultationDto } from "./dto/update-consultation.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async getMyAppointments(authorization: string | undefined) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("appointments")
      .select(
        "id, facility_id, appointment_date, start_time, end_time, service_type, reason, notes, status, created_at, facilities(name, city, type)",
      )
      .eq("patient_user_id", user.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async getFacilityAppointments(
    authorization: string | undefined,
    facilityId: string,
  ) {
    const user = await this.getUserFromAuthorization(authorization);
    await assertFacilityAccess(this.supabaseService, user.id, facilityId, [
      "tenant_admin",
      "facility_operator",
      "pharmacy_admin",
      "ambulance_admin",
      "blood_bank_admin",
      "doctor",
    ]);

    const { data, error } = await this.supabaseService.adminClient
      .from("appointments")
      .select(
        "id, patient_user_id, facility_id, appointment_date, start_time, end_time, service_type, reason, notes, status, created_at, profiles(full_name, phone, email)",
      )
      .eq("facility_id", facilityId)
      .order("appointment_date", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async getDoctorAppointments(authorization: string | undefined) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("appointments")
      .select(
        "id, patient_user_id, facility_id, appointment_date, start_time, end_time, service_type, reason, notes, status, consultation_notes, diagnosis_summary, prescription_notes, created_at, profiles(full_name, phone, email), facilities(name, city, type)",
      )
      .eq("doctor_user_id", user.id)
      .order("appointment_date", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async createAppointment(
    authorization: string | undefined,
    dto: CreateAppointmentDto,
  ) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data: slot, error: slotError } = await this.supabaseService.adminClient
      .from("appointment_slots")
      .select("*")
      .eq("id", dto.slotId)
      .eq("facility_id", dto.facilityId)
      .single();

    if (slotError) {
      throw new InternalServerErrorException(slotError.message);
    }

    if (!slot) {
      throw new NotFoundException("Appointment slot not found.");
    }

    if (slot.status !== "available" || slot.booked_count >= slot.capacity) {
      throw new InternalServerErrorException("Selected slot is no longer available.");
    }

    const { data: appointment, error: appointmentError } = await this.supabaseService.adminClient
      .from("appointments")
      .insert({
        patient_user_id: user.id,
        facility_id: dto.facilityId,
        slot_id: dto.slotId,
        doctor_user_id: slot.doctor_user_id ?? null,
        appointment_date: slot.slot_date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        service_type: slot.service_type,
        reason: dto.reason,
        notes: dto.notes ?? null,
        status: "confirmed",
      })
      .select("*")
      .single();

    if (appointmentError) {
      throw new InternalServerErrorException(appointmentError.message);
    }

    const nextBookedCount = Number(slot.booked_count) + 1;
    const nextStatus = nextBookedCount >= Number(slot.capacity) ? "full" : "available";

    const { error: updateError } = await this.supabaseService.adminClient
      .from("appointment_slots")
      .update({
        booked_count: nextBookedCount,
        status: nextStatus,
      })
      .eq("id", dto.slotId);

    if (updateError) {
      throw new InternalServerErrorException(updateError.message);
    }

    const { data: facility, error: facilityError } = await this.supabaseService.adminClient
      .from("facilities")
      .select("tenant_id, name")
      .eq("id", dto.facilityId)
      .single();

    if (facilityError) {
      throw new InternalServerErrorException(facilityError.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: facility.tenant_id,
      facilityId: dto.facilityId,
      eventType: "appointment.created",
      entityType: "appointment",
      entityId: appointment.id,
      metadata: {
        facilityName: facility.name,
        patientUserId: user.id,
        slotId: dto.slotId,
        appointmentDate: appointment.appointment_date,
        startTime: appointment.start_time,
        endTime: appointment.end_time,
        status: appointment.status,
        serviceType: appointment.service_type,
      },
    });

    return {
      message: "Appointment confirmed",
      appointment,
    };
  }

  async updateAppointmentStatus(
    authorization: string | undefined,
    dto: UpdateAppointmentStatusDto,
  ) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data: existingAppointment, error: existingAppointmentError } =
      await this.supabaseService.adminClient
        .from("appointments")
        .select("id, facility_id, status")
        .eq("id", dto.appointmentId)
        .single();

    if (existingAppointmentError) {
      throw new InternalServerErrorException(existingAppointmentError.message);
    }

    await assertFacilityAccess(
      this.supabaseService,
      user.id,
      existingAppointment.facility_id,
      [
        "tenant_admin",
        "facility_operator",
        "pharmacy_admin",
        "ambulance_admin",
        "blood_bank_admin",
        "doctor",
      ],
    );

    const { data, error } = await this.supabaseService.adminClient
      .from("appointments")
      .update({
        status: dto.status,
      })
      .eq("id", dto.appointmentId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: facility, error: facilityError } = await this.supabaseService.adminClient
      .from("facilities")
      .select("tenant_id, name")
      .eq("id", data.facility_id)
      .single();

    if (facilityError) {
      throw new InternalServerErrorException(facilityError.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: facility.tenant_id,
      facilityId: data.facility_id,
      eventType: "appointment.status_updated",
      entityType: "appointment",
      entityId: data.id,
      metadata: {
        facilityName: facility.name,
        previousStatus: existingAppointment.status,
        nextStatus: data.status,
      },
    });

    return data;
  }

  async updateConsultation(
    authorization: string | undefined,
    dto: UpdateConsultationDto,
  ) {
    const user = await this.getUserFromAuthorization(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("appointments")
      .update({
        consultation_notes: dto.consultationNotes ?? null,
        diagnosis_summary: dto.diagnosisSummary ?? null,
        prescription_notes: dto.prescriptionNotes ?? null,
        status: dto.status ?? "completed",
      })
      .eq("id", dto.appointmentId)
      .eq("doctor_user_id", user.id)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: facility, error: facilityError } = await this.supabaseService.adminClient
      .from("facilities")
      .select("tenant_id, name")
      .eq("id", data.facility_id)
      .single();

    if (facilityError) {
      throw new InternalServerErrorException(facilityError.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: facility.tenant_id,
      facilityId: data.facility_id,
      eventType: "consultation.updated",
      entityType: "appointment",
      entityId: data.id,
      metadata: {
        facilityName: facility.name,
        doctorUserId: user.id,
        status: data.status,
        hasConsultationNotes: Boolean(dto.consultationNotes),
        hasDiagnosisSummary: Boolean(dto.diagnosisSummary),
        hasPrescriptionNotes: Boolean(dto.prescriptionNotes),
      },
    });

    return data;
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
