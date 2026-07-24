import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class ReviewAmbulanceDriverApplicationDto {
  @IsIn(["approved", "rejected"])
  status!: "approved" | "rejected";

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
