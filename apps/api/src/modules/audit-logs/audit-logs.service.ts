import { Injectable } from "@nestjs/common";

@Injectable()
export class AuditLogsService {
  getTemplate() {
    return {
      eventTypes: [
        "tenant.created",
        "facility.created",
        "user.invited",
        "user.role_assigned",
        "auth.signup_started",
      ],
      rule: "All privileged actions must be written to an immutable audit stream.",
    };
  }
}

