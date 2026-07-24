import { IsBoolean, IsLatitude, IsLongitude, IsOptional } from "class-validator";

export class UpdateAmbulanceUnitAvailabilityDto {
  @IsBoolean()
  active!: boolean;

  @IsOptional()
  @IsLatitude()
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  longitude?: number;
}
