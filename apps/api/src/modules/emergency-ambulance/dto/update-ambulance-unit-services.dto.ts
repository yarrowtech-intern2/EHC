import { ArrayMaxSize, IsArray, IsIn } from "class-validator";

export const ambulanceServiceCodes = [
  "emergency_ambulance",
  "patient_transfer",
  "inter_hospital_transfer",
  "icu_ambulance",
  "oxygen_support",
  "dead_body_transport",
] as const;

export type AmbulanceServiceCode = (typeof ambulanceServiceCodes)[number];

export class UpdateAmbulanceUnitServicesDto {
  @IsArray()
  @ArrayMaxSize(6)
  @IsIn(ambulanceServiceCodes, { each: true })
  serviceCodes!: AmbulanceServiceCode[];
}
