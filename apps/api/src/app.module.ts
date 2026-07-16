import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AppointmentSlotsModule } from "./modules/appointment-slots/appointment-slots.module";
import { AppointmentRequestsModule } from "./modules/appointment-requests/appointment-requests.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { AppConfigModule } from "./config/app-config.module";
import { AuditLogsModule } from "./modules/audit-logs/audit-logs.module";
import { AuthModule } from "./modules/auth/auth.module";
import { FacilitiesModule } from "./modules/facilities/facilities.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppConfigModule,
    AppointmentSlotsModule,
    AppointmentRequestsModule,
    AppointmentsModule,
    AuthModule,
    TenantsModule,
    FacilitiesModule,
    UsersModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
