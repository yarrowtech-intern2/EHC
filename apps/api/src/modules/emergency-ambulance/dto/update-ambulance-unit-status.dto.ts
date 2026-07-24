import { IsIn } from "class-validator";

export class UpdateAmbulanceUnitStatusDto {
  @IsIn(["offline", "available", "busy", "maintenance"])
  status!: "offline" | "available" | "busy" | "maintenance";
}
