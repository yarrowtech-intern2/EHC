import { Body, Controller, Get, Headers, Post } from "@nestjs/common";

import { CreateTenantDto } from "./dto/create-tenant.dto";
import { TenantsService } from "./tenants.service";

@Controller("tenants")
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get("template")
  getTemplate() {
    return this.tenantsService.getTenantTemplate();
  }

  @Get("public")
  getPublicTenants() {
    return this.tenantsService.getPublicTenants();
  }

  @Get("mine")
  getMyTenants(@Headers("authorization") authorization: string | undefined) {
    return this.tenantsService.getMyTenants(authorization);
  }

  @Post()
  createTenant(
    @Body() dto: CreateTenantDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.tenantsService.createTenant(dto, authorization);
  }
}
