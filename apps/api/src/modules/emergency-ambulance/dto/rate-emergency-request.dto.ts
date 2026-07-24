import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class RateEmergencyRequestDto {
  @IsString()
  token!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  ratingScore!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedbackComment?: string;
}
