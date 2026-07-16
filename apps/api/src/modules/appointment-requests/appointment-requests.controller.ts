import { Body, Controller, Headers, Post } from "@nestjs/common";

import { AppointmentRequestsService } from "./appointment-requests.service";
import { CreateAppointmentRequestDto } from "./dto/create-appointment-request.dto";

@Controller("appointment-requests")
export class AppointmentRequestsController {
  constructor(
    private readonly appointmentRequestsService: AppointmentRequestsService,
  ) {}

  @Post()
  createAppointmentRequest(
    @Headers("authorization") authorization: string | undefined,
    @Body() dto: CreateAppointmentRequestDto,
  ) {
    return this.appointmentRequestsService.createAppointmentRequest(
      authorization,
      dto,
    );
  }
}

