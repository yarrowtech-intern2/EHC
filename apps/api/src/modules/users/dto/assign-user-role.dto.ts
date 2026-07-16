import { IsOptional, IsString } from "class-validator";

export class AssignUserRoleDto {
  @IsString()
  email!: string;

  @IsString()
  role!: string;

  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  facilityId?: string;
}
