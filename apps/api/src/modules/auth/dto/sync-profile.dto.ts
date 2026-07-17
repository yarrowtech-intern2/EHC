import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

import { ActorType } from "./begin-signup.dto";

export class SyncProfileDto {
  @IsOptional()
  @IsEnum(ActorType)
  actorType?: ActorType;

  @IsOptional()
  @IsString()
  onboardingSessionId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(130)
  age?: number;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
