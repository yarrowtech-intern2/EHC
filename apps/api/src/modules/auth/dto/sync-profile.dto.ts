import { IsEnum, IsOptional, IsString } from "class-validator";

import { ActorType } from "./begin-signup.dto";

export class SyncProfileDto {
  @IsOptional()
  @IsEnum(ActorType)
  actorType?: ActorType;

  @IsOptional()
  @IsString()
  onboardingSessionId?: string;
}
