import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: "ehc-api",
      status: "ok",
      phase: "phase-1-foundation",
    };
  }
}

