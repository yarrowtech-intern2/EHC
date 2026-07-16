import { Body, Controller, Get, Post, Query } from "@nestjs/common";

import { AppointmentSlotsService } from "./appointment-slots.service";
import { CreateAppointmentSlotDto } from "./dto/create-appointment-slot.dto";

@Controller("appointment-slots")
export class AppointmentSlotsController {
  constructor(private readonly appointmentSlotsService: AppointmentSlotsService) {}

  @Get("public")
  getPublicSlots(
    @Query("facilityId") facilityId: string,
    @Query("date") date?: string,
  ) {
    return this.appointmentSlotsService.getPublicSlots(facilityId, date);
  }

  @Post()
  createSlot(@Body() dto: CreateAppointmentSlotDto) {
    return this.appointmentSlotsService.createSlot(dto);
  }
}

