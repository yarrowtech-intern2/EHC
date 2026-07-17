import { Controller, Get, Headers, Query } from "@nestjs/common";

import { AuditLogsService } from "./audit-logs.service";

@Controller("audit-logs")
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  getLogs(
    @Headers("authorization") authorization: string | undefined,
    @Query("tenantId") tenantId?: string,
    @Query("facilityId") facilityId?: string,
    @Query("actorUserId") actorUserId?: string,
    @Query("eventType") eventType?: string,
    @Query("entityType") entityType?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
  ) {
    return this.auditLogsService.getLogs(authorization, {
      tenantId,
      facilityId,
      actorUserId,
      eventType,
      entityType,
      from,
      to,
      limit,
    });
  }

  @Get("template")
  getTemplate() {
    return this.auditLogsService.getTemplate();
  }
}
