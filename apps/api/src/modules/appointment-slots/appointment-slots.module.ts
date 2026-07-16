import { Module } from "@nestjs/common";

import { AppointmentSlotsController } from "./appointment-slots.controller";
import { AppointmentSlotsService } from "./appointment-slots.service";

@Module({
  controllers: [AppointmentSlotsController],
  providers: [AppointmentSlotsService],
})
export class AppointmentSlotsModule {}

