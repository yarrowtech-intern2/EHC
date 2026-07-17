import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";

import { CreateFacilityDto } from "./dto/create-facility.dto";
import { FacilitiesService } from "./facilities.service";

@Controller("facilities")
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get("types")
  getFacilityTypes() {
    return this.facilitiesService.getFacilityTypes();
  }

  @Get("public")
  getPublicFacilities() {
    return this.facilitiesService.getPublicFacilities();
  }

  @Get("mine")
  getMyFacilities(@Headers("authorization") authorization: string | undefined) {
    return this.facilitiesService.getMyFacilities(authorization);
  }

  @Get("public/:id")
  getPublicFacilityById(@Param("id") id: string) {
    return this.facilitiesService.getPublicFacilityById(id);
  }

  @Post()
  createFacility(
    @Body() dto: CreateFacilityDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.facilitiesService.createFacility(dto, authorization);
  }
}
