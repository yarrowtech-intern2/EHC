import { IsIn } from "class-validator";

export class UpdateEmergencyRequestStatusDto {
  @IsIn(["en_route", "arrived", "transporting", "completed", "cancelled"])
  status!: "en_route" | "arrived" | "transporting" | "completed" | "cancelled";
}
