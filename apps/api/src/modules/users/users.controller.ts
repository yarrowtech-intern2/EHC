import { Body, Controller, Get, Post, Query } from "@nestjs/common";

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
  getDoctors() {
    return this.usersService.getDoctors();
  }

  @Get("members")
  getMembers(
    @Query("tenantId") tenantId?: string,
    @Query("facilityId") facilityId?: string,
  ) {
    return this.usersService.getMembers(tenantId, facilityId);
  }

  @Post("assign-role")
  assignRole(@Body() dto: AssignUserRoleDto) {
    return this.usersService.assignRole(dto);
  }
}
