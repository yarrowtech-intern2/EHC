import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateAppointmentRequestDto {
  @IsString()
  facilityId!: string;

  @IsString()
  serviceType!: string;

  @IsDateString()
  preferredDate!: string;

  @IsString()
  preferredTime!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

