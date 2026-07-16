import { Body, Controller, Get, Post } from "@nestjs/common";

import { CreateFacilityDto } from "./dto/create-facility.dto";
import { FacilitiesService } from "./facilities.service";

@Controller("facilities")
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get("types")
  getFacilityTypes() {
    return this.facilitiesService.getFacilityTypes();
  }

  @Post()
  createFacility(@Body() dto: CreateFacilityDto) {
    return this.facilitiesService.createFacility(dto);
  }
}

