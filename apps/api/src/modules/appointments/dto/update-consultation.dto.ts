import { IsOptional, IsString } from "class-validator";

export class UpdateConsultationDto {
  @IsString()
  appointmentId!: string;

  @IsOptional()
  @IsString()
  consultationNotes?: string;

  @IsOptional()
  @IsString()
  diagnosisSummary?: string;

  @IsOptional()
  @IsString()
  prescriptionNotes?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

