import { Module } from "@nestjs/common";

import { AuditLogsModule } from "../audit-logs/audit-logs.module";
import { EmergencyAmbulanceController } from "./emergency-ambulance.controller";
import { EmergencyAmbulanceService } from "./emergency-ambulance.service";

@Module({
  imports: [AuditLogsModule],
  controllers: [EmergencyAmbulanceController],
  providers: [EmergencyAmbulanceService],
})
export class EmergencyAmbulanceModule {}
