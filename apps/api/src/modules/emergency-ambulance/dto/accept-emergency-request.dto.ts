import { IsString } from "class-validator";

export class AcceptEmergencyRequestDto {
  @IsString()
  unitId!: string;
}
