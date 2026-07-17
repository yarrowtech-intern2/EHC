import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";
import { AppointmentSlotsController } from "./appointment-slots.controller";
import { AppointmentSlotsService } from "./appointment-slots.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [AppointmentSlotsController],
  providers: [AppointmentSlotsService],
})
export class AppointmentSlotsModule {}
