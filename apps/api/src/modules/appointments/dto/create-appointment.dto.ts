import { IsOptional, IsString } from "class-validator";

export class CreateAppointmentDto {
  @IsString()
  facilityId!: string;

  @IsString()
  slotId!: string;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

