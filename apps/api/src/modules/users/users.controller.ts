import { Body, Controller, Get, Headers, Post, Query } from "@nestjs/common";

import { AssignUserRoleDto } from "./dto/assign-user-role.dto";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("roles")
  getRoles() {
    return this.usersService.getBaseRoles();
  }

  @Get("doctors")
  getDoctors(
    @Headers("authorization") authorization: string | undefined,
    @Query("tenantId") tenantId?: string,
    @Query("facilityId") facilityId?: string,
  ) {
    return this.usersService.getDoctors(authorization, tenantId, facilityId);
  }

  @Get("members")
  getMembers(
    @Headers("authorization") authorization: string | undefined,
    @Query("tenantId") tenantId?: string,
    @Query("facilityId") facilityId?: string,
  ) {
    return this.usersService.getMembers(authorization, tenantId, facilityId);
  }

  @Post("assign-role")
  assignRole(
    @Body() dto: AssignUserRoleDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.usersService.assignRole(dto, authorization);
  }
}
