import { Module } from "@nestjs/common";

import { AppointmentRequestsController } from "./appointment-requests.controller";
import { AppointmentRequestsService } from "./appointment-requests.service";

@Module({
  controllers: [AppointmentRequestsController],
  providers: [AppointmentRequestsService],
})
export class AppointmentRequestsModule {}

