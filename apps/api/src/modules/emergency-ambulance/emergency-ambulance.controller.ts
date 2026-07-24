import { Body, Controller, Get, Headers, Param, Patch, Post, Query } from "@nestjs/common";

import { AcceptEmergencyRequestDto } from "./dto/accept-emergency-request.dto";
import { CreateAmbulanceUnitDto } from "./dto/create-ambulance-unit.dto";
import { CreateAmbulanceDriverApplicationDto } from "./dto/create-ambulance-driver-application.dto";
import { CreateEmergencyAmbulanceRequestDto } from "./dto/create-emergency-ambulance-request.dto";
import { RateEmergencyRequestDto } from "./dto/rate-emergency-request.dto";
import { ReviewAmbulanceDriverApplicationDto } from "./dto/review-ambulance-driver-application.dto";
import { UpdateAmbulanceUnitAvailabilityDto } from "./dto/update-ambulance-unit-availability.dto";
import { UpdateAmbulanceUnitLocationDto } from "./dto/update-ambulance-unit-location.dto";
import { UpdateAmbulanceUnitServicesDto } from "./dto/update-ambulance-unit-services.dto";
import { UpdateAmbulanceUnitStatusDto } from "./dto/update-ambulance-unit-status.dto";
import { UpdateEmergencyRequestStatusDto } from "./dto/update-emergency-request-status.dto";
import { EmergencyAmbulanceService } from "./emergency-ambulance.service";

@Controller("emergency-ambulance")
export class EmergencyAmbulanceController {
  constructor(private readonly emergencyAmbulanceService: EmergencyAmbulanceService) {}

  @Post("requests")
  createRequest(
    @Body() dto: CreateEmergencyAmbulanceRequestDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.createRequest(dto, authorization);
  }

  @Get("requests/mine")
  getMyRequests(@Headers("authorization") authorization: string | undefined) {
    return this.emergencyAmbulanceService.getMyRequests(authorization);
  }

  @Get("driver/application")
  getMyDriverApplication(@Headers("authorization") authorization: string | undefined) {
    return this.emergencyAmbulanceService.getMyDriverApplication(authorization);
  }

  @Post("driver/applications")
  createDriverApplication(
    @Body() dto: CreateAmbulanceDriverApplicationDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.createDriverApplication(dto, authorization);
  }

  @Get("admin/driver-applications")
  getDriverApplications(
    @Headers("authorization") authorization: string | undefined,
    @Query("status") status?: string,
  ) {
    return this.emergencyAmbulanceService.getDriverApplications(authorization, status);
  }

  @Patch("admin/driver-applications/:id/review")
  reviewDriverApplication(
    @Param("id") id: string,
    @Body() dto: ReviewAmbulanceDriverApplicationDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.reviewDriverApplication(id, dto, authorization);
  }

  @Get("requests/:id/track")
  trackRequest(@Param("id") id: string, @Query("token") token?: string) {
    return this.emergencyAmbulanceService.trackRequest(id, token);
  }

  @Get("operator/requests")
  getOperatorRequests(
    @Headers("authorization") authorization: string | undefined,
    @Query("radiusKm") radiusKm?: string,
  ) {
    return this.emergencyAmbulanceService.getOperatorRequests(authorization, radiusKm);
  }

  @Get("operator/dashboard")
  getOperatorDashboard(@Headers("authorization") authorization: string | undefined) {
    return this.emergencyAmbulanceService.getOperatorDashboard(authorization);
  }

  @Post("requests/:id/accept")
  acceptRequest(
    @Param("id") id: string,
    @Body() dto: AcceptEmergencyRequestDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.acceptRequest(id, dto, authorization);
  }

  @Patch("requests/:id/status")
  updateRequestStatus(
    @Param("id") id: string,
    @Body() dto: UpdateEmergencyRequestStatusDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.updateRequestStatus(id, dto, authorization);
  }

  @Post("requests/:id/rating")
  rateRequest(@Param("id") id: string, @Body() dto: RateEmergencyRequestDto) {
    return this.emergencyAmbulanceService.rateRequest(id, dto);
  }

  @Get("units")
  getUnits(@Headers("authorization") authorization: string | undefined) {
    return this.emergencyAmbulanceService.getUnits(authorization);
  }

  @Post("units")
  createUnit(
    @Body() dto: CreateAmbulanceUnitDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.createUnit(dto, authorization);
  }

  @Patch("units/:id/location")
  updateUnitLocation(
    @Param("id") id: string,
    @Body() dto: UpdateAmbulanceUnitLocationDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.updateUnitLocation(id, dto, authorization);
  }

  @Patch("units/:id/availability")
  updateUnitAvailability(
    @Param("id") id: string,
    @Body() dto: UpdateAmbulanceUnitAvailabilityDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.updateUnitAvailability(id, dto, authorization);
  }

  @Patch("units/:id/services")
  updateUnitServices(
    @Param("id") id: string,
    @Body() dto: UpdateAmbulanceUnitServicesDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.updateUnitServices(id, dto, authorization);
  }

  @Patch("units/:id/status")
  updateUnitStatus(
    @Param("id") id: string,
    @Body() dto: UpdateAmbulanceUnitStatusDto,
    @Headers("authorization") authorization: string | undefined,
  ) {
    return this.emergencyAmbulanceService.updateUnitStatus(id, dto, authorization);
  }
}
