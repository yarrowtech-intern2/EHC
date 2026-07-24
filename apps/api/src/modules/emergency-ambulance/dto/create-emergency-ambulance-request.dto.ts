import { IsLatitude, IsLongitude, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateEmergencyAmbulanceRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  patientName!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(32)
  patientPhone!: string;

  @IsLatitude()
  pickupLatitude!: number;

  @IsLongitude()
  pickupLongitude!: number;

  @IsOptional()
  @IsString()
  @MaxLength(240)
  pickupAddress?: string;
}
