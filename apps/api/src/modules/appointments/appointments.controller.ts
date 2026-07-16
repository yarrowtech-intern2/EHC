import { Body, Controller, Get, Headers, Patch, Post, Query } from "@nestjs/common";

import { AppointmentsService } from "./appointments.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateConsultationDto } from "./dto/update-consultation.dto";
import { UpdateAppointmentStatusDto } from "./dto/update-appointment-status.dto";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("my")
  getMyAppointments(@Headers("authorization") authorization: string | undefined) {
    return this.appointmentsService.getMyAppointments(authorization);
  }

  @Get("facility")
  getFacilityAppointments(
    @Query("facilityId") facilityId: string,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.appointmentsService.getFacilityAppointments(authorization, facilityId);
  }

  @Get("doctor")
  getDoctorAppointments(
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.appointmentsService.getDoctorAppointments(authorization);
  }

  @Post()
  createAppointment(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(authorization, dto);
  }

  @Patch("status")
  updateAppointmentStatus(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateAppointmentStatus(authorization, dto);
  }

  @Patch("consultation")
  updateConsultation(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: UpdateConsultationDto,
  ) {
    return this.appointmentsService.updateConsultation(authorization, dto);
  }
}
