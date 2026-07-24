import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";

import {
  assertFacilityAccess,
  getAccessibleTenantIds,
  getUserFromAuthorization,
} from "../../common/access-control";
import { SupabaseService } from "../../config/supabase.service";
import { AuditLogsService } from "../audit-logs/audit-logs.service";
import { AcceptEmergencyRequestDto } from "./dto/accept-emergency-request.dto";
import { CreateAmbulanceDriverApplicationDto } from "./dto/create-ambulance-driver-application.dto";
import { CreateAmbulanceUnitDto } from "./dto/create-ambulance-unit.dto";
import { CreateEmergencyAmbulanceRequestDto } from "./dto/create-emergency-ambulance-request.dto";
import { RateEmergencyRequestDto } from "./dto/rate-emergency-request.dto";
import { ReviewAmbulanceDriverApplicationDto } from "./dto/review-ambulance-driver-application.dto";
import { UpdateAmbulanceUnitAvailabilityDto } from "./dto/update-ambulance-unit-availability.dto";
import { UpdateAmbulanceUnitLocationDto } from "./dto/update-ambulance-unit-location.dto";
import {
  ambulanceServiceCodes,
  type AmbulanceServiceCode,
  UpdateAmbulanceUnitServicesDto,
} from "./dto/update-ambulance-unit-services.dto";
import { UpdateAmbulanceUnitStatusDto } from "./dto/update-ambulance-unit-status.dto";
import { UpdateEmergencyRequestStatusDto } from "./dto/update-emergency-request-status.dto";

type AmbulanceUnit = {
  id: string;
  tenant_id?: string;
  facility_id?: string;
  driver_user_id?: string | null;
  vehicle_number: string;
  driver_name: string | null;
  driver_phone: string | null;
  status: "offline" | "available" | "busy" | "maintenance";
  verification_status?: "pending_verification" | "approved" | "rejected";
  verification_notes?: string | null;
  service_codes?: string[] | null;
  current_latitude: number | string | null;
  current_longitude: number | string | null;
  last_location_at: string | null;
  facilities?: { name?: string | null; city?: string | null } | { name?: string | null; city?: string | null }[] | null;
};

type EmergencyRequest = {
  id: string;
  tracking_token?: string;
  patient_user_id: string | null;
  patient_name: string;
  patient_phone: string;
  pickup_address: string | null;
  pickup_latitude: number | string;
  pickup_longitude: number | string;
  status: EmergencyRequestStatus;
  tenant_id: string | null;
  facility_id: string | null;
  ambulance_unit_id: string | null;
  accepted_by_user_id: string | null;
  accepted_at: string | null;
  status_updated_at: string;
  completed_at?: string | null;
  service_code?: string;
  estimated_distance_km?: number | string | null;
  distance_fee_amount?: number | string | null;
  service_fee_amount?: number | string | null;
  platform_fee_amount?: number | string | null;
  total_fare_amount?: number | string | null;
  rating_score?: number | null;
  feedback_comment?: string | null;
  rated_at?: string | null;
  created_at: string;
  ambulance_units?: AmbulanceUnit | AmbulanceUnit[] | null;
};

type EmergencyRequestStatus =
  | "requested"
  | "accepted"
  | "en_route"
  | "arrived"
  | "transporting"
  | "completed"
  | "cancelled";

type DriverApplicationStatus = "pending_verification" | "approved" | "rejected";

type DriverApplication = {
  id: string;
  user_id: string;
  tenant_id: string | null;
  facility_id: string | null;
  ambulance_unit_id: string | null;
  full_name: string;
  phone: string;
  email: string | null;
  service_name: string;
  city: string;
  vehicle_number: string;
  license_number: string;
  ambulance_permit_number: string;
  documents: Record<string, unknown>;
  status: DriverApplicationStatus;
  admin_notes: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

const AMBULANCE_OPERATOR_ROLES = [
  "tenant_admin",
  "facility_operator",
  "ambulance_admin",
  "ambulance_driver",
] as const;

const DEFAULT_SERVICE_CODE: AmbulanceServiceCode = "emergency_ambulance";
const DISTANCE_FEE_PER_KM = 35;
const DEFAULT_SERVICE_FEE = 500;
const DEFAULT_PLATFORM_FEE = 49;

const serviceLabels: Record<AmbulanceServiceCode, string> = {
  emergency_ambulance: "Emergency ambulance",
  patient_transfer: "Patient transfer",
  inter_hospital_transfer: "Inter-hospital transfer",
  icu_ambulance: "ICU ambulance",
  oxygen_support: "Oxygen support",
  dead_body_transport: "Dead body transport",
};

@Injectable()
export class EmergencyAmbulanceService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async createRequest(
    dto: CreateEmergencyAmbulanceRequestDto,
    authorization: string | undefined,
  ) {
    const user = await this.getOptionalUser(authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .insert({
        patient_user_id: user?.id ?? null,
        patient_name: dto.patientName.trim(),
        patient_phone: dto.patientPhone.trim(),
        pickup_address: dto.pickupAddress?.trim() || null,
        pickup_latitude: dto.pickupLatitude,
        pickup_longitude: dto.pickupLongitude,
        status: "requested",
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.recordRequestEvent({
      requestId: data.id,
      actorUserId: user?.id ?? null,
      eventType: "emergency_ambulance.requested",
      status: "requested",
      latitude: dto.pickupLatitude,
      longitude: dto.pickupLongitude,
      metadata: {
        guestRequest: !user,
        hasPickupAddress: Boolean(dto.pickupAddress),
      },
    });

    return {
      message: "Emergency ambulance request created.",
      request: this.toPublicRequest(data, true),
    };
  }

  async getMyRequests(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select(
        "id, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, created_at, ambulance_units(id, vehicle_number, driver_name, driver_phone, status, current_latitude, current_longitude, last_location_at)",
      )
      .eq("patient_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((request) => this.toPublicRequest(request));
  }

  async getMyDriverApplication(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data ? this.toDriverApplicationResponse(data as DriverApplication) : null;
  }

  async createDriverApplication(
    dto: CreateAmbulanceDriverApplicationDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const { data: existing, error: existingError } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingError) {
      throw new InternalServerErrorException(existingError.message);
    }

    if (existing) {
      throw new BadRequestException("An ambulance driver application already exists for this account.");
    }

    const normalizedVehicleNumber = dto.vehicleNumber.trim().toUpperCase();
    const now = new Date().toISOString();

    const { data: tenant, error: tenantError } = await this.supabaseService.adminClient
      .from("tenants")
      .insert({
        legal_name: dto.serviceName.trim(),
        display_name: dto.serviceName.trim(),
        category: "small_vendor",
        allows_patient_self_service: true,
        primary_contact_user_id: user.id,
        status: "draft",
      })
      .select("*")
      .single();

    if (tenantError) {
      throw new InternalServerErrorException(tenantError.message);
    }

    const { data: facility, error: facilityError } = await this.supabaseService.adminClient
      .from("facilities")
      .insert({
        tenant_id: tenant.id,
        name: dto.serviceName.trim(),
        type: "ambulance_unit",
        city: dto.city.trim(),
        contact_number: dto.phone.trim(),
        status: "draft",
        serves_patients_directly: true,
      })
      .select("*")
      .single();

    if (facilityError) {
      throw new InternalServerErrorException(facilityError.message);
    }

    const { data: unit, error: unitError } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .insert({
        tenant_id: tenant.id,
        facility_id: facility.id,
        driver_user_id: user.id,
        vehicle_number: normalizedVehicleNumber,
        driver_name: dto.fullName.trim(),
        driver_phone: dto.phone.trim(),
        status: "offline",
        verification_status: "pending_verification",
        verification_notes: null,
        verified_by_user_id: null,
        verified_at: null,
      })
      .select("*")
      .single();

    if (unitError) {
      throw new InternalServerErrorException(unitError.message);
    }

    const { error: roleError } = await this.supabaseService.adminClient
      .from("user_roles")
      .insert({
        user_id: user.id,
        tenant_id: tenant.id,
        facility_id: facility.id,
        role: "ambulance_driver",
      });

    if (roleError) {
      throw new InternalServerErrorException(roleError.message);
    }

    const { error: profileError } = await this.supabaseService.adminClient
      .from("profiles")
      .update({
        tenant_id: tenant.id,
        facility_id: facility.id,
        full_name: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim().toLowerCase() || user.email || null,
        account_type: "ambulance_driver",
        status: "draft",
        updated_at: now,
      })
      .eq("id", user.id);

    if (profileError) {
      throw new InternalServerErrorException(profileError.message);
    }

    const { data: application, error: applicationError } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .insert({
        user_id: user.id,
        tenant_id: tenant.id,
        facility_id: facility.id,
        ambulance_unit_id: unit.id,
        full_name: dto.fullName.trim(),
        phone: dto.phone.trim(),
        email: dto.email?.trim().toLowerCase() || user.email || null,
        service_name: dto.serviceName.trim(),
        city: dto.city.trim(),
        vehicle_number: normalizedVehicleNumber,
        license_number: dto.licenseNumber.trim(),
        ambulance_permit_number: dto.ambulancePermitNumber.trim(),
        documents: dto.documents,
        status: "pending_verification",
      })
      .select("*")
      .single();

    if (applicationError) {
      throw new InternalServerErrorException(applicationError.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: tenant.id,
      facilityId: facility.id,
      eventType: "ambulance_driver.application_submitted",
      entityType: "ambulance_driver_application",
      entityId: application.id,
      metadata: {
        vehicleNumber: normalizedVehicleNumber,
        city: dto.city.trim(),
        status: "pending_verification",
      },
    });

    return {
      message: "Ambulance driver verification submitted.",
      application: this.toDriverApplicationResponse(application as DriverApplication),
    };
  }

  async getDriverApplications(authorization: string | undefined, status?: string) {
    await this.assertSuperAdmin(authorization);

    let query = this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && ["pending_verification", "approved", "rejected"].includes(status)) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((application) =>
      this.toDriverApplicationResponse(application as DriverApplication),
    );
  }

  async reviewDriverApplication(
    applicationId: string,
    dto: ReviewAmbulanceDriverApplicationDto,
    authorization: string | undefined,
  ) {
    const reviewer = await this.assertSuperAdmin(authorization);
    const now = new Date().toISOString();

    const { data: application, error: applicationError } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (applicationError) {
      throw new NotFoundException("Ambulance driver application not found.");
    }

    const nextRecordStatus = dto.status === "approved" ? "active" : "inactive";
    const nextUnitStatus = dto.status === "approved" ? "offline" : "maintenance";

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_driver_applications")
      .update({
        status: dto.status,
        admin_notes: dto.notes ?? null,
        reviewed_by_user_id: reviewer.id,
        reviewed_at: now,
        updated_at: now,
      })
      .eq("id", applicationId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (application.ambulance_unit_id) {
      const { error: unitError } = await this.supabaseService.adminClient
        .from("ambulance_units")
        .update({
          verification_status: dto.status,
          verification_notes: dto.notes ?? null,
          verified_by_user_id: reviewer.id,
          verified_at: now,
          status: nextUnitStatus,
          updated_at: now,
        })
        .eq("id", application.ambulance_unit_id);

      if (unitError) {
        throw new InternalServerErrorException(unitError.message);
      }
    }

    if (application.tenant_id) {
      const { error: tenantError } = await this.supabaseService.adminClient
        .from("tenants")
        .update({
          status: nextRecordStatus,
          updated_at: now,
        })
        .eq("id", application.tenant_id);

      if (tenantError) {
        throw new InternalServerErrorException(tenantError.message);
      }
    }

    if (application.facility_id) {
      const { error: facilityError } = await this.supabaseService.adminClient
        .from("facilities")
        .update({
          status: nextRecordStatus,
          updated_at: now,
        })
        .eq("id", application.facility_id);

      if (facilityError) {
        throw new InternalServerErrorException(facilityError.message);
      }
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: application.tenant_id,
      facilityId: application.facility_id,
      eventType: "ambulance_driver.application_reviewed",
      entityType: "ambulance_driver_application",
      entityId: applicationId,
      metadata: {
        previousStatus: application.status,
        nextStatus: dto.status,
        vehicleNumber: application.vehicle_number,
        notes: dto.notes ?? null,
      },
    });

    return {
      message: `Ambulance driver application ${dto.status}.`,
      application: this.toDriverApplicationResponse(data as DriverApplication),
    };
  }

  async trackRequest(id: string, token?: string) {
    if (!token) {
      throw new UnauthorizedException("Tracking token is required.");
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select(
        "id, tracking_token, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, created_at, ambulance_units(id, vehicle_number, driver_name, driver_phone, status, current_latitude, current_longitude, last_location_at, facilities(name, city))",
      )
      .eq("id", id)
      .eq("tracking_token", token)
      .single();

    if (error) {
      throw new NotFoundException("Emergency ambulance request not found.");
    }

    return this.toPublicRequest(data);
  }

  async getOperatorRequests(authorization: string | undefined, radiusKm?: string) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const units = await this.getAccessibleUnitsForUser(user.id);
    const radius = this.parseRadius(radiusKm);

    if (units.length === 0) {
      return {
        active: [],
        nearby: [],
        units: [],
        radiusKm: radius,
      };
    }

    const unitFacilityIds = Array.from(new Set(units.map((unit) => unit.facility_id)));

    const activeQuery = this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select(
        "id, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, created_at, ambulance_units(id, vehicle_number, driver_name, driver_phone, status, current_latitude, current_longitude, last_location_at)",
      )
      .in("facility_id", unitFacilityIds)
      .in("status", ["accepted", "en_route", "arrived", "transporting"])
      .order("status_updated_at", { ascending: false });

    const requestedQuery = this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select(
        "id, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, created_at",
      )
      .eq("status", "requested")
      .order("created_at", { ascending: true })
      .limit(50);

    const [{ data: active, error: activeError }, { data: requested, error: requestedError }] =
      await Promise.all([activeQuery, requestedQuery]);

    if (activeError) {
      throw new InternalServerErrorException(activeError.message);
    }

    if (requestedError) {
      throw new InternalServerErrorException(requestedError.message);
    }

    const nearby = (requested ?? [])
      .map((request) => this.attachNearestUnit(request, units))
      .filter((request) => request.nearestUnit && request.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm || a.createdAtMs - b.createdAtMs)
      .map(({ createdAtMs: _createdAtMs, ...request }) => request);

    return {
      active: (active ?? []).map((request) => this.toOperatorRequest(request)),
      nearby,
      units: units.map((unit) => this.toUnitResponse(unit)),
      radiusKm: radius,
    };
  }

  async getOperatorDashboard(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const units = await this.getAccessibleUnitsForUser(user.id, true);

    if (units.length === 0) {
      return this.emptyOperatorDashboard();
    }

    const unitIds = units.map((unit) => unit.id);
    const facilityIds = Array.from(new Set(units.map((unit) => unit.facility_id).filter(Boolean) as string[]));

    const [requestsResult, feedbackResult] = await Promise.all([
      this.supabaseService.adminClient
        .from("emergency_ambulance_requests")
        .select(
          "id, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, completed_at, service_code, estimated_distance_km, distance_fee_amount, service_fee_amount, platform_fee_amount, total_fare_amount, rating_score, feedback_comment, rated_at, created_at, ambulance_units(id, vehicle_number, driver_name, driver_phone, status, verification_status, service_codes, current_latitude, current_longitude, last_location_at)",
        )
        .in("ambulance_unit_id", unitIds)
        .order("created_at", { ascending: false })
        .limit(200),
      this.supabaseService.adminClient
        .from("emergency_ambulance_requests")
        .select(
          "id, patient_name, rating_score, feedback_comment, rated_at, ambulance_unit_id, created_at",
        )
        .in("ambulance_unit_id", unitIds)
        .not("rating_score", "is", null)
        .order("rated_at", { ascending: false })
        .limit(30),
    ]);

    if (requestsResult.error) {
      throw new InternalServerErrorException(requestsResult.error.message);
    }

    if (feedbackResult.error) {
      throw new InternalServerErrorException(feedbackResult.error.message);
    }

    const requests = ((requestsResult.data ?? []) as unknown as EmergencyRequest[]).map((request) =>
      this.toOperatorRequest(request),
    );
    const activeTrips = requests.filter((request) =>
      ["accepted", "en_route", "arrived", "transporting"].includes(request.status),
    );
    const history = requests.filter((request) => ["completed", "cancelled"].includes(request.status));
    const completedTrips = requests.filter((request) => request.status === "completed");
    const totalEarnings = completedTrips.reduce((total, request) => total + Number(request.totalFareAmount ?? 0), 0);
    const averageRating = this.average(
      (feedbackResult.data ?? [])
        .map((entry) => Number(entry.rating_score))
        .filter((score) => Number.isFinite(score)),
    );

    return {
      overview: {
        activeTrips: activeTrips.length,
        completedTrips: completedTrips.length,
        cancelledTrips: history.filter((request) => request.status === "cancelled").length,
        totalEarnings,
        averageRating,
        availableUnits: units.filter((unit) => unit.status === "available").length,
        inactiveUnits: units.filter((unit) => unit.status === "offline").length,
        servicesCovered: this.getCoveredServiceCodes(units).length,
        facilityScope: facilityIds.length,
      },
      units: units.map((unit) => this.toUnitResponse(unit)),
      servicesCovered: this.getCoveredServiceCodes(units).map((code) => ({
        code,
        label: serviceLabels[code],
        unitCount: units.filter((unit) => this.getUnitServiceCodes(unit).includes(code)).length,
      })),
      activeTrips,
      history: history.slice(0, 50),
      earnings: {
        total: totalEarnings,
        completedTrips: completedTrips.length,
        averageFare: completedTrips.length ? Math.round(totalEarnings / completedTrips.length) : 0,
        rows: completedTrips.slice(0, 30).map((request) => ({
          id: request.id,
          patientName: request.patientName,
          completedAt: request.completedAt,
          totalFareAmount: request.totalFareAmount,
          estimatedDistanceKm: request.estimatedDistanceKm,
        })),
      },
      feedback: (feedbackResult.data ?? []).map((entry) => ({
        id: entry.id,
        patientName: entry.patient_name,
        ratingScore: entry.rating_score,
        feedbackComment: entry.feedback_comment,
        ratedAt: entry.rated_at,
      })),
    };
  }

  async acceptRequest(
    requestId: string,
    dto: AcceptEmergencyRequestDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const unit = await this.getUnitForAccess(dto.unitId, user.id);

    if (unit.status !== "available") {
      throw new BadRequestException("Ambulance unit must be available before accepting a request.");
    }

    if (unit.verification_status !== "approved") {
      throw new BadRequestException("Ambulance unit must be verified before accepting requests.");
    }

    const { data: request, error: requestError } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .update({
        status: "accepted",
        tenant_id: unit.tenant_id,
        facility_id: unit.facility_id,
        ambulance_unit_id: unit.id,
        accepted_by_user_id: user.id,
        accepted_at: new Date().toISOString(),
        status_updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("status", "requested")
      .select("*")
      .maybeSingle();

    if (requestError) {
      throw new InternalServerErrorException(requestError.message);
    }

    if (!request) {
      throw new BadRequestException("This emergency request has already been accepted or is no longer available.");
    }

    const fare = this.calculateFare({
      pickupLatitude: Number(request.pickup_latitude),
      pickupLongitude: Number(request.pickup_longitude),
      unitLatitude: this.toNullableNumber(unit.current_latitude),
      unitLongitude: this.toNullableNumber(unit.current_longitude),
    });

    const { data: pricedRequest, error: fareError } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .update({
        service_code: DEFAULT_SERVICE_CODE,
        estimated_distance_km: fare.estimatedDistanceKm,
        distance_fee_amount: fare.distanceFeeAmount,
        service_fee_amount: fare.serviceFeeAmount,
        platform_fee_amount: fare.platformFeeAmount,
        total_fare_amount: fare.totalFareAmount,
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (fareError) {
      throw new InternalServerErrorException(fareError.message);
    }

    const { error: unitError } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .update({
        status: "busy",
        updated_at: new Date().toISOString(),
      })
      .eq("id", unit.id);

    if (unitError) {
      throw new InternalServerErrorException(unitError.message);
    }

    await this.recordRequestEvent({
      requestId,
      actorUserId: user.id,
      eventType: "emergency_ambulance.accepted",
      status: "accepted",
      latitude: this.toNullableNumber(unit.current_latitude),
      longitude: this.toNullableNumber(unit.current_longitude),
      metadata: {
        unitId: unit.id,
        vehicleNumber: unit.vehicle_number,
        estimatedDistanceKm: fare.estimatedDistanceKm,
        totalFareAmount: fare.totalFareAmount,
      },
    });

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: unit.tenant_id,
      facilityId: unit.facility_id,
      eventType: "emergency_ambulance.accepted",
      entityType: "emergency_ambulance_request",
      entityId: requestId,
      metadata: {
        unitId: unit.id,
        vehicleNumber: unit.vehicle_number,
        patientPhone: request.patient_phone,
        estimatedDistanceKm: fare.estimatedDistanceKm,
        totalFareAmount: fare.totalFareAmount,
      },
    });

    return {
      message: "Emergency request accepted.",
      request: this.toOperatorRequest({ ...pricedRequest, ambulance_units: unit }),
    };
  }

  async updateRequestStatus(
    requestId: string,
    dto: UpdateEmergencyRequestStatusDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const { data: existing, error: existingError } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select("id, facility_id, ambulance_unit_id, status")
      .eq("id", requestId)
      .single();

    if (existingError) {
      throw new NotFoundException("Emergency ambulance request not found.");
    }

    if (!existing.facility_id) {
      throw new BadRequestException("Request must be accepted before status can be updated.");
    }

    await assertFacilityAccess(this.supabaseService, user.id, existing.facility_id, [
      ...AMBULANCE_OPERATOR_ROLES,
    ]);

    const now = new Date().toISOString();
    const terminalUpdate =
      dto.status === "completed"
        ? { completed_at: now }
        : dto.status === "cancelled"
          ? { cancelled_at: now }
          : {};

    const { data, error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .update({
        status: dto.status,
        status_updated_at: now,
        updated_at: now,
        ...terminalUpdate,
      })
      .eq("id", requestId)
      .select(
        "id, patient_user_id, patient_name, patient_phone, pickup_address, pickup_latitude, pickup_longitude, status, tenant_id, facility_id, ambulance_unit_id, accepted_by_user_id, accepted_at, status_updated_at, created_at, ambulance_units(id, vehicle_number, driver_name, driver_phone, status, current_latitude, current_longitude, last_location_at)",
      )
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (["completed", "cancelled"].includes(dto.status) && existing.ambulance_unit_id) {
      const { error: unitError } = await this.supabaseService.adminClient
        .from("ambulance_units")
        .update({
          status: "available",
          updated_at: now,
        })
        .eq("id", existing.ambulance_unit_id);

      if (unitError) {
        throw new InternalServerErrorException(unitError.message);
      }
    }

    await this.recordRequestEvent({
      requestId,
      actorUserId: user.id,
      eventType: "emergency_ambulance.status_updated",
      status: dto.status,
      metadata: {
        previousStatus: existing.status,
        nextStatus: dto.status,
      },
    });

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: data.tenant_id,
      facilityId: data.facility_id,
      eventType: "emergency_ambulance.status_updated",
      entityType: "emergency_ambulance_request",
      entityId: data.id,
      metadata: {
        previousStatus: existing.status,
        nextStatus: dto.status,
      },
    });

    return this.toOperatorRequest(data);
  }

  async getUnits(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const units = await this.getAccessibleUnitsForUser(user.id, true);

    return units.map((unit) => this.toUnitResponse(unit));
  }

  async createUnit(dto: CreateAmbulanceUnitDto, authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const facility = await assertFacilityAccess(this.supabaseService, user.id, dto.facilityId, [
      "tenant_admin",
      "facility_operator",
      "ambulance_admin",
    ]);

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .insert({
        tenant_id: facility.tenant_id,
        facility_id: dto.facilityId,
        driver_user_id: dto.driverUserId ?? null,
        vehicle_number: dto.vehicleNumber.trim(),
        driver_name: dto.driverName?.trim() || null,
        driver_phone: dto.driverPhone?.trim() || null,
        status: dto.currentLatitude && dto.currentLongitude ? "available" : "offline",
        verification_status: "approved",
        current_latitude: dto.currentLatitude ?? null,
        current_longitude: dto.currentLongitude ?? null,
        last_location_at: dto.currentLatitude && dto.currentLongitude ? new Date().toISOString() : null,
      })
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: facility.tenant_id,
      facilityId: dto.facilityId,
      eventType: "ambulance_unit.created",
      entityType: "ambulance_unit",
      entityId: data.id,
      metadata: {
        vehicleNumber: data.vehicle_number,
        driverUserId: data.driver_user_id,
      },
    });

    return {
      message: "Ambulance unit created.",
      unit: this.toUnitResponse(data),
    };
  }

  async updateUnitLocation(
    unitId: string,
    dto: UpdateAmbulanceUnitLocationDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const unit = await this.getUnitForAccess(unitId, user.id);
    const now = new Date().toISOString();

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .update({
        current_latitude: dto.latitude,
        current_longitude: dto.longitude,
        last_location_at: now,
        updated_at: now,
        status:
          unit.status === "offline" && unit.verification_status === "approved"
            ? "available"
            : unit.status,
      })
      .eq("id", unitId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { data: activeRequest, error: activeRequestError } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select("id, status")
      .eq("ambulance_unit_id", unitId)
      .in("status", ["accepted", "en_route", "arrived", "transporting"])
      .order("status_updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (activeRequestError) {
      throw new InternalServerErrorException(activeRequestError.message);
    }

    if (activeRequest) {
      await this.recordRequestEvent({
        requestId: activeRequest.id,
        actorUserId: user.id,
        eventType: "emergency_ambulance.driver_location_updated",
        status: activeRequest.status as EmergencyRequestStatus,
        latitude: dto.latitude,
        longitude: dto.longitude,
      });
    }

    return this.toUnitResponse(data);
  }

  async updateUnitAvailability(
    unitId: string,
    dto: UpdateAmbulanceUnitAvailabilityDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const unit = await this.getUnitForAccess(unitId, user.id);
    const now = new Date().toISOString();

    if (unit.status === "busy") {
      throw new BadRequestException("Busy ambulance units cannot be set inactive during an active trip.");
    }

    if (!dto.active) {
      const { data, error } = await this.supabaseService.adminClient
        .from("ambulance_units")
        .update({
          status: "offline",
          updated_at: now,
        })
        .eq("id", unitId)
        .select("*")
        .single();

      if (error) {
        throw new InternalServerErrorException(error.message);
      }

      return this.toUnitResponse(data);
    }

    if (unit.verification_status !== "approved") {
      throw new BadRequestException("Ambulance unit must be verified before going active.");
    }

    if (dto.latitude === undefined || dto.longitude === undefined) {
      throw new BadRequestException("Precise current location is required before going active.");
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .update({
        status: "available",
        current_latitude: dto.latitude,
        current_longitude: dto.longitude,
        last_location_at: now,
        updated_at: now,
      })
      .eq("id", unitId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: unit.tenant_id,
      facilityId: unit.facility_id,
      eventType: "ambulance_unit.availability_updated",
      entityType: "ambulance_unit",
      entityId: unitId,
      metadata: {
        previousStatus: unit.status,
        nextStatus: "available",
      },
    });

    return this.toUnitResponse(data);
  }

  async updateUnitServices(
    unitId: string,
    dto: UpdateAmbulanceUnitServicesDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const unit = await this.getUnitForAccess(unitId, user.id);
    const serviceCodes = dto.serviceCodes.length ? dto.serviceCodes : [DEFAULT_SERVICE_CODE];

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .update({
        service_codes: serviceCodes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", unitId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: unit.tenant_id,
      facilityId: unit.facility_id,
      eventType: "ambulance_unit.services_updated",
      entityType: "ambulance_unit",
      entityId: unitId,
      metadata: {
        serviceCodes,
      },
    });

    return this.toUnitResponse(data);
  }

  async rateRequest(requestId: string, dto: RateEmergencyRequestDto) {
    const { data: existing, error: existingError } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .select("id, tracking_token, status, rating_score")
      .eq("id", requestId)
      .eq("tracking_token", dto.token)
      .single();

    if (existingError) {
      throw new NotFoundException("Emergency ambulance request not found.");
    }

    if (existing.status !== "completed") {
      throw new BadRequestException("Feedback can be submitted only after a completed trip.");
    }

    if (existing.rating_score) {
      throw new BadRequestException("Feedback has already been submitted for this trip.");
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_requests")
      .update({
        rating_score: dto.ratingScore,
        feedback_comment: dto.feedbackComment?.trim() || null,
        rated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.recordRequestEvent({
      requestId,
      eventType: "emergency_ambulance.feedback_submitted",
      status: "completed",
      metadata: {
        ratingScore: dto.ratingScore,
        hasComment: Boolean(dto.feedbackComment),
      },
    });

    return {
      message: "Feedback submitted.",
      request: this.toPublicRequest(data),
    };
  }

  async updateUnitStatus(
    unitId: string,
    dto: UpdateAmbulanceUnitStatusDto,
    authorization: string | undefined,
  ) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);
    const unit = await this.getUnitForAccess(unitId, user.id);

    if (dto.status === "available" && unit.verification_status !== "approved") {
      throw new BadRequestException("Ambulance unit must be verified before going available.");
    }

    const { data, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .update({
        status: dto.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", unitId)
      .select("*")
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.auditLogsService.recordEvent({
      authorization,
      tenantId: unit.tenant_id,
      facilityId: unit.facility_id,
      eventType: "ambulance_unit.status_updated",
      entityType: "ambulance_unit",
      entityId: unitId,
      metadata: {
        previousStatus: unit.status,
        nextStatus: dto.status,
      },
    });

    return this.toUnitResponse(data);
  }

  private async getAccessibleUnitsForUser(userId: string, includeAllStatuses = false) {
    const tenantIds = await getAccessibleTenantIds(this.supabaseService, userId, [
      ...AMBULANCE_OPERATOR_ROLES,
    ]);

    let query = this.supabaseService.adminClient
      .from("ambulance_units")
      .select("*, facilities(name, city)")
      .order("created_at", { ascending: false });

    if (tenantIds.length > 0) {
      query = query.in("tenant_id", tenantIds);
    } else {
      query = query.eq("driver_user_id", userId);
    }

    if (!includeAllStatuses) {
      query = query.in("status", ["available", "busy"]);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).filter((unit) => {
      if (unit.driver_user_id === userId) {
        return true;
      }

      return tenantIds.includes(unit.tenant_id);
    }) as AmbulanceUnit[];
  }

  private async getUnitForAccess(unitId: string, userId: string) {
    const { data: unit, error } = await this.supabaseService.adminClient
      .from("ambulance_units")
      .select("*")
      .eq("id", unitId)
      .single();

    if (error) {
      throw new NotFoundException("Ambulance unit not found.");
    }

    if (unit.driver_user_id !== userId) {
      await assertFacilityAccess(this.supabaseService, userId, unit.facility_id, [
        ...AMBULANCE_OPERATOR_ROLES,
      ]);
    }

    return unit as AmbulanceUnit;
  }

  private attachNearestUnit(request: EmergencyRequest, units: AmbulanceUnit[]) {
    const pickupLat = Number(request.pickup_latitude);
    const pickupLng = Number(request.pickup_longitude);
    const candidates = units
      .filter((unit) => unit.status === "available")
      .filter((unit) => unit.verification_status === "approved")
      .map((unit) => {
        const unitLat = this.toNullableNumber(unit.current_latitude);
        const unitLng = this.toNullableNumber(unit.current_longitude);

        if (unitLat === null || unitLng === null) {
          return null;
        }

        return {
          unit,
          distanceKm: this.distanceKm(pickupLat, pickupLng, unitLat, unitLng),
        };
      })
      .filter(Boolean) as Array<{ unit: AmbulanceUnit; distanceKm: number }>;

    const nearest = candidates.sort((a, b) => a.distanceKm - b.distanceKm)[0];

    return {
      ...this.toOperatorRequest(request),
      nearestUnit: nearest ? this.toUnitResponse(nearest.unit) : null,
      distanceKm: nearest ? Number(nearest.distanceKm.toFixed(2)) : Number.POSITIVE_INFINITY,
      createdAtMs: new Date(request.created_at).getTime(),
    };
  }

  private toPublicRequest(request: EmergencyRequest, includeTrackingToken = false) {
    const unit = this.firstRelation(request.ambulance_units);

    return {
      id: request.id,
      trackingToken: includeTrackingToken ? request.tracking_token : undefined,
      patientName: request.patient_name,
      patientPhone: request.patient_phone,
      pickupAddress: request.pickup_address,
      pickupLatitude: Number(request.pickup_latitude),
      pickupLongitude: Number(request.pickup_longitude),
      status: request.status,
      acceptedAt: request.accepted_at,
      statusUpdatedAt: request.status_updated_at,
      completedAt: request.completed_at ?? null,
      serviceCode: request.service_code ?? DEFAULT_SERVICE_CODE,
      estimatedDistanceKm: this.toNullableNumber(request.estimated_distance_km),
      distanceFeeAmount: this.toNumber(request.distance_fee_amount),
      serviceFeeAmount: this.toNumber(request.service_fee_amount),
      platformFeeAmount: this.toNumber(request.platform_fee_amount),
      totalFareAmount: this.toNumber(request.total_fare_amount),
      ratingScore: request.rating_score ?? null,
      feedbackComment: request.feedback_comment ?? null,
      ratedAt: request.rated_at ?? null,
      createdAt: request.created_at,
      ambulanceUnit: unit ? this.toUnitResponse(unit) : null,
    };
  }

  private toOperatorRequest(request: EmergencyRequest) {
    return {
      id: request.id,
      patientName: request.patient_name,
      patientPhone: request.patient_phone,
      pickupAddress: request.pickup_address,
      pickupLatitude: Number(request.pickup_latitude),
      pickupLongitude: Number(request.pickup_longitude),
      status: request.status,
      tenantId: request.tenant_id,
      facilityId: request.facility_id,
      ambulanceUnitId: request.ambulance_unit_id,
      acceptedByUserId: request.accepted_by_user_id,
      acceptedAt: request.accepted_at,
      statusUpdatedAt: request.status_updated_at,
      completedAt: request.completed_at ?? null,
      serviceCode: request.service_code ?? DEFAULT_SERVICE_CODE,
      estimatedDistanceKm: this.toNullableNumber(request.estimated_distance_km),
      distanceFeeAmount: this.toNumber(request.distance_fee_amount),
      serviceFeeAmount: this.toNumber(request.service_fee_amount),
      platformFeeAmount: this.toNumber(request.platform_fee_amount),
      totalFareAmount: this.toNumber(request.total_fare_amount),
      ratingScore: request.rating_score ?? null,
      feedbackComment: request.feedback_comment ?? null,
      ratedAt: request.rated_at ?? null,
      createdAt: request.created_at,
      ambulanceUnit: this.firstRelation(request.ambulance_units)
        ? this.toUnitResponse(this.firstRelation(request.ambulance_units) as AmbulanceUnit)
        : null,
    };
  }

  private toUnitResponse(unit: AmbulanceUnit) {
    const facility = this.firstRelation(unit.facilities);

    return {
      id: unit.id,
      tenantId: unit.tenant_id ?? null,
      facilityId: unit.facility_id ?? null,
      facilityName: facility?.name ?? null,
      facilityCity: facility?.city ?? null,
      driverUserId: unit.driver_user_id,
      vehicleNumber: unit.vehicle_number,
      driverName: unit.driver_name,
      driverPhone: unit.driver_phone,
      status: unit.status,
      verificationStatus: unit.verification_status ?? "approved",
      verificationNotes: unit.verification_notes ?? null,
      serviceCodes: this.getUnitServiceCodes(unit),
      currentLatitude: this.toNullableNumber(unit.current_latitude),
      currentLongitude: this.toNullableNumber(unit.current_longitude),
      lastLocationAt: unit.last_location_at,
    };
  }

  private async recordRequestEvent({
    requestId,
    actorUserId,
    eventType,
    status,
    latitude,
    longitude,
    metadata,
  }: {
    requestId: string;
    actorUserId?: string | null;
    eventType: string;
    status?: EmergencyRequestStatus;
    latitude?: number | null;
    longitude?: number | null;
    metadata?: Record<string, unknown>;
  }) {
    const { error } = await this.supabaseService.adminClient
      .from("emergency_ambulance_request_events")
      .insert({
        request_id: requestId,
        actor_user_id: actorUserId ?? null,
        event_type: eventType,
        status: status ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        metadata: metadata ?? {},
      });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private toDriverApplicationResponse(application: DriverApplication) {
    return {
      id: application.id,
      userId: application.user_id,
      tenantId: application.tenant_id,
      facilityId: application.facility_id,
      ambulanceUnitId: application.ambulance_unit_id,
      fullName: application.full_name,
      phone: application.phone,
      email: application.email,
      serviceName: application.service_name,
      city: application.city,
      vehicleNumber: application.vehicle_number,
      licenseNumber: application.license_number,
      ambulancePermitNumber: application.ambulance_permit_number,
      documents: application.documents ?? {},
      status: application.status,
      adminNotes: application.admin_notes,
      reviewedByUserId: application.reviewed_by_user_id,
      reviewedAt: application.reviewed_at,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
    };
  }

  private async assertSuperAdmin(authorization: string | undefined) {
    const user = await getUserFromAuthorization(this.supabaseService, authorization);

    const { data, error } = await this.supabaseService.adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "super_admin")
      .limit(1);

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    if (!data.length) {
      throw new UnauthorizedException("Super admin access is required.");
    }

    return user;
  }

  private async getOptionalUser(authorization: string | undefined) {
    const token = authorization?.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return null;
    }

    const { data, error } = await this.supabaseService.adminClient.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    return data.user;
  }

  private parseRadius(radiusKm?: string) {
    const parsed = Number(radiusKm ?? "5");

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 5;
    }

    return Math.min(parsed, 25);
  }

  private emptyOperatorDashboard() {
    return {
      overview: {
        activeTrips: 0,
        completedTrips: 0,
        cancelledTrips: 0,
        totalEarnings: 0,
        averageRating: 0,
        availableUnits: 0,
        inactiveUnits: 0,
        servicesCovered: 0,
        facilityScope: 0,
      },
      units: [],
      servicesCovered: [],
      activeTrips: [],
      history: [],
      earnings: {
        total: 0,
        completedTrips: 0,
        averageFare: 0,
        rows: [],
      },
      feedback: [],
    };
  }

  private getCoveredServiceCodes(units: AmbulanceUnit[]) {
    const codes = new Set<AmbulanceServiceCode>();

    for (const unit of units) {
      for (const code of this.getUnitServiceCodes(unit)) {
        codes.add(code);
      }
    }

    return Array.from(codes);
  }

  private getUnitServiceCodes(unit: AmbulanceUnit) {
    const codes = unit.service_codes ?? [DEFAULT_SERVICE_CODE];

    return codes.filter((code): code is AmbulanceServiceCode =>
      (ambulanceServiceCodes as readonly string[]).includes(code),
    );
  }

  private calculateFare({
    pickupLatitude,
    pickupLongitude,
    unitLatitude,
    unitLongitude,
  }: {
    pickupLatitude: number;
    pickupLongitude: number;
    unitLatitude: number | null;
    unitLongitude: number | null;
  }) {
    const estimatedDistanceKm =
      unitLatitude === null || unitLongitude === null
        ? 0
        : Number(this.distanceKm(pickupLatitude, pickupLongitude, unitLatitude, unitLongitude).toFixed(2));
    const distanceFeeAmount = Number((estimatedDistanceKm * DISTANCE_FEE_PER_KM).toFixed(2));
    const totalFareAmount = Number(
      (distanceFeeAmount + DEFAULT_SERVICE_FEE + DEFAULT_PLATFORM_FEE).toFixed(2),
    );

    return {
      estimatedDistanceKm,
      distanceFeeAmount,
      serviceFeeAmount: DEFAULT_SERVICE_FEE,
      platformFeeAmount: DEFAULT_PLATFORM_FEE,
      totalFareAmount,
    };
  }

  private average(values: number[]) {
    if (values.length === 0) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Number((total / values.length).toFixed(1));
  }

  private distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadiusKm * c;
  }

  private toRadians(value: number) {
    return (value * Math.PI) / 180;
  }

  private toNullableNumber(value: number | string | null | undefined) {
    if (value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toNumber(value: number | string | null | undefined) {
    return this.toNullableNumber(value) ?? 0;
  }

  private firstRelation<T>(value: T | T[] | null | undefined): T | null {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }

    return value ?? null;
  }
}
