import { IsLatitude, IsLongitude } from "class-validator";

export class UpdateAmbulanceUnitLocationDto {
  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;
}
