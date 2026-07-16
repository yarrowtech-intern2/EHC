import { IsEnum, IsOptional, IsString } from "class-validator";

export enum FacilityType {
  HOSPITAL = "hospital",
  CLINIC = "clinic",
  PHARMACY = "pharmacy",
  LAB = "lab",
  AMBULANCE_UNIT = "ambulance_unit",
  INDEPENDENT_VENDOR = "independent_vendor",
}

export class CreateFacilityDto {
  @IsString()
  tenantId!: string;

  @IsString()
  name!: string;

  @IsEnum(FacilityType)
  type!: FacilityType;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  city?: string;
}

