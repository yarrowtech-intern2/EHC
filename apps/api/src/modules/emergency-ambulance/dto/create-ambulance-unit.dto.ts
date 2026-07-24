import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateAmbulanceUnitDto {
  @IsString()
  facilityId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(32)
  vehicleNumber!: string;

  @IsOptional()
  @IsString()
  driverUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  driverName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  driverPhone?: string;

  @IsOptional()
  @IsLatitude()
  currentLatitude?: number;

  @IsOptional()
  @IsLongitude()
  currentLongitude?: number;
}
