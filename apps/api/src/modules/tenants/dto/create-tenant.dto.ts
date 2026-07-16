import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";

export enum TenantCategory {
  ORGANIZATION = "organization",
  SMALL_VENDOR = "small_vendor",
}

export class CreateTenantDto {
  @IsString()
  legalName!: string;

  @IsString()
  displayName!: string;

  @IsEnum(TenantCategory)
  category!: TenantCategory;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsBoolean()
  allowsPatientSelfService?: boolean;
}

