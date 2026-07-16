import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
  getBaseRoles() {
    return [
      "super_admin",
      "tenant_admin",
      "doctor",
      "patient",
      "pharmacy_admin",
      "ambulance_admin",
      "blood_bank_admin",
    ];
  }
}

