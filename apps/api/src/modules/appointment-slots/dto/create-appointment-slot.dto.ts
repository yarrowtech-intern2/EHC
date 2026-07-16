import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateAppointmentSlotDto {
  @IsString()
  facilityId!: string;

  @IsOptional()
  @IsString()
  doctorUserId?: string;

  @IsDateString()
  slotDate!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  serviceType!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  capacity?: number;
}
