# Service Build Checklist

Living checklist for building EHC services one by one. Update this document after each service decision, migration, API change, UI change, and verification pass so project context stays visible.

## Service order

1. Emergency ambulance service
2. Doctor clinic service
3. Pharmacy medicine service
4. Blood bank service

Status legend:

- `Not started`: no implementation work yet
- `In progress`: active implementation
- `Blocked`: waiting for a decision or dependency
- `Built`: implementation completed
- `Verified`: smoke-tested end to end

## Shared service foundation

Status: `In progress`

Use this section for shared work that applies to more than one service.

- [ ] Confirm shared facility model for all four services.
- [x] Confirm final role names and permissions for emergency ambulance MVP.
- [x] Confirm patient-facing discovery and request flow for emergency ambulance MVP.
- [x] Confirm tenant/facility operator workflow for emergency ambulance MVP.
- [ ] Confirm audit log events required for service operations.
- [ ] Add or update Supabase tables, enums, indexes, and RLS policies.
- [ ] Add or update NestJS modules, DTOs, services, controllers, and guards.
- [ ] Add or update Next.js routes, forms, dashboards, and patient views.
- [ ] Add validation, loading, empty, error, and success states.
- [x] Run API build or type checks.
- [x] Run web build or type checks.
- [ ] Smoke-test auth, role access, create/list/update flows, and audit logs.
- [x] Add compact admin dashboard analytics endpoint and chart-based dashboard UI.

## Emergency Ambulance Service

Status: `In progress`

Goal: let patients request emergency ambulance help and let ambulance operators manage service availability, dispatch, and request status.

Decisions needed:

- [x] Request types: emergency only for MVP.
- [x] Location capture: browser GPS required, typed landmark/address optional.
- [x] Dispatch model: nearby available units are listed; first operator/driver to accept wins.
- [x] Pricing/payment scope for first version: skipped.
- [x] Operator role: use `ambulance_admin`, `facility_operator`, `tenant_admin`, and new `ambulance_driver`.
- [x] Destination hospital: skipped for MVP.
- [x] Map provider: keyless OpenStreetMap embed for development; production tile provider can be chosen later.
- [x] Nearby radius: 5 km primary radius, API capped at 25 km.
- [x] Guest booking: allowed; request returns a private tracking token.
- [x] Independent ambulance drivers: self-register, submit verification documents with images, and stay offline until super-admin approval.
- [x] Driver-to-unit model: one independent driver maps to one ambulance unit for MVP.
- [x] Ambulance dashboard roles: drivers see their own assigned unit; ambulance admins, tenant admins, and facility operators see scoped fleet data.
- [x] Active/inactive rule: verified ambulances start inactive/offline; going active requires precise browser GPS.
- [x] Pricing model: total fare equals distance fee plus service fee plus platform fee.
- [x] Feedback model: patients can rate only after completed trips.

Database checklist:

- [x] Ambulance facility metadata.
- [x] Ambulance vehicle/unit records.
- [x] Ambulance availability status.
- [x] Ambulance request records.
- [x] Request status history.
- [x] RLS policies for patients, operators, tenant admins, and super admins.
- [x] Ambulance driver verification application records.
- [x] Ambulance unit verification status gate.
- [x] Ambulance service coverage codes per unit.
- [x] Ambulance trip fare, distance, rating, and feedback fields.

API checklist:

- [x] Patient creates ambulance request.
- [x] Patient lists own requests.
- [x] Operator lists tenant/facility requests.
- [x] Operator updates request status.
- [x] Operator manages ambulance units and availability.
- [x] Audit logs for dispatch, status changes, and unit changes.
- [x] Request events for guest request creation and driver location updates.
- [x] Driver submits independent ambulance verification application.
- [x] Super admin lists and reviews driver applications.
- [x] Unverified ambulance units cannot go available or accept requests.
- [x] Operator dashboard overview endpoint for active trips, history, earnings, services, ratings, and fleet stats.
- [x] Driver/operator active-inactive endpoint with precise GPS requirement.
- [x] Unit service coverage update endpoint.
- [x] Completed-trip feedback endpoint.
- [x] Fare calculation on accepted trips using distance fee, service fee, and platform fee.

Web checklist:

- [x] Patient emergency ambulance request page.
- [x] Patient request status view.
- [x] Admin ambulance operations page.
- [x] Vehicle/unit management UI.
- [x] Status update controls.
- [x] Empty, error, and loading states.
- [x] Independent ambulance driver onboarding page.
- [x] Super-admin driver verification dashboard.
- [x] Ambulance dashboard tabs: overview, incoming requests, map, history, services covered, earnings, feedback, and fleet.
- [x] Overview data visualization with trip and fleet charts.
- [x] Fleet active/inactive controls with precise GPS sharing.
- [x] Active-trip workflow controls for en route, arrived, transporting, completed, and cancelled.

Verification checklist:

- [ ] Patient can create a request.
- [ ] Operator can see only scoped requests.
- [ ] Operator can update status.
- [ ] Patient sees status update.
- [ ] Unauthorized roles are blocked.
- [ ] Audit logs record key actions.

## Doctor Clinic Service

Status: `Not started`

Goal: let clinics manage doctors, slots, appointments, and consultations while patients discover doctors and book visits.

Decisions needed:

- [ ] Appointment types: clinic visit, teleconsultation, or both.
- [ ] Doctor profile fields required for first version.
- [ ] Slot model: doctor-specific, facility-wide, or both.
- [ ] Consultation notes and prescription scope.
- [ ] Operator role: use `doctor`, `facility_operator`, `tenant_admin`, or a mix.

Database checklist:

- [ ] Doctor profile details.
- [ ] Doctor-to-facility assignment.
- [ ] Clinic service categories or specialties.
- [ ] Appointment slot enhancements if needed.
- [ ] Consultation notes and prescription records if in scope.
- [ ] RLS policies for patients, doctors, operators, tenant admins, and super admins.

API checklist:

- [ ] Patient discovers clinics/doctors.
- [ ] Patient books appointment.
- [ ] Patient lists own appointments.
- [ ] Doctor/operator manages slots.
- [ ] Doctor/operator updates appointment status.
- [ ] Doctor records consultation details if in scope.
- [ ] Audit logs for booking, status updates, slot changes, and consultation updates.

Web checklist:

- [ ] Doctor discovery page or filters.
- [ ] Booking flow.
- [ ] Patient appointments page.
- [ ] Admin clinic dashboard.
- [ ] Slot management UI.
- [ ] Doctor appointment worklist.
- [ ] Consultation update UI if in scope.

Verification checklist:

- [ ] Patient can discover and book a doctor.
- [ ] Doctor/operator can manage scoped slots.
- [ ] Doctor/operator can update appointment status.
- [ ] Patient sees appointment status.
- [ ] Unauthorized roles are blocked.
- [ ] Audit logs record key actions.

## Pharmacy Medicine Service

Status: `Not started`

Goal: let pharmacies publish medicine availability and let patients search, request, or order medicines.

Decisions needed:

- [ ] First version supports availability inquiry, reservation, or purchase order.
- [ ] Prescription upload required for restricted medicines.
- [ ] Delivery, pickup, or both.
- [ ] Inventory depth: simple stock status or quantity/batch/expiry tracking.
- [ ] Operator role: use `pharmacy_admin`, `facility_operator`, or both.

Database checklist:

- [ ] Pharmacy facility metadata.
- [ ] Medicine catalog.
- [ ] Pharmacy inventory records.
- [ ] Medicine request/order records.
- [ ] Prescription attachment metadata if in scope.
- [ ] RLS policies for patients, pharmacy operators, tenant admins, and super admins.

API checklist:

- [ ] Patient searches medicines/pharmacies.
- [ ] Patient creates medicine request/order.
- [ ] Patient lists own requests/orders.
- [ ] Operator manages inventory.
- [ ] Operator updates request/order status.
- [ ] Audit logs for inventory changes and request/order status changes.

Web checklist:

- [ ] Medicine search page.
- [ ] Medicine request/order flow.
- [ ] Patient request/order status page.
- [ ] Admin pharmacy dashboard.
- [ ] Inventory management UI.
- [ ] Request/order status controls.

Verification checklist:

- [ ] Patient can search medicine availability.
- [ ] Patient can create request/order.
- [ ] Operator can manage scoped inventory.
- [ ] Operator can update request/order status.
- [ ] Unauthorized roles are blocked.
- [ ] Audit logs record key actions.

## Blood Bank Service

Status: `Not started`

Goal: let blood banks publish blood availability and let patients or facilities request blood units.

Decisions needed:

- [ ] Requester types: patient only, facility only, or both.
- [ ] Inventory depth: blood group counts only or component/unit-level tracking.
- [ ] Supported components: whole blood, packed RBC, plasma, platelets.
- [ ] Emergency request priority model.
- [ ] Operator role: use `blood_bank_admin`, `facility_operator`, or both.

Database checklist:

- [ ] Blood bank facility metadata.
- [ ] Blood group/component inventory.
- [ ] Blood request records.
- [ ] Request priority and status history.
- [ ] Donor records if in first version.
- [ ] RLS policies for requesters, blood bank operators, tenant admins, and super admins.

API checklist:

- [ ] Patient/facility searches blood availability.
- [ ] Requester creates blood request.
- [ ] Requester lists own requests.
- [ ] Operator manages blood inventory.
- [ ] Operator updates request status.
- [ ] Audit logs for inventory changes, request creation, and status changes.

Web checklist:

- [ ] Blood availability search page.
- [ ] Blood request flow.
- [ ] Request status page.
- [ ] Admin blood bank dashboard.
- [ ] Inventory management UI.
- [ ] Request triage/status controls.

Verification checklist:

- [ ] Requester can search availability.
- [ ] Requester can create request.
- [ ] Operator can manage scoped inventory.
- [ ] Operator can update request status.
- [ ] Unauthorized roles are blocked.
- [ ] Audit logs record key actions.

## Running Notes

Use this log for service-by-service progress.

| Date | Service | Update |
| --- | --- | --- |
| 2026-07-24 | Planning | Created service checklist document. |
| 2026-07-24 | Emergency ambulance | Built MVP schema, API module, guest patient request/tracking flow, and ambulance ops dashboard. Verification pending. |
| 2026-07-24 | Emergency ambulance | API build and web build passed. Local API health and emergency page returned HTTP 200. Database smoke test still requires applying the new Supabase migration. |
| 2026-07-24 | Emergency ambulance | Added independent driver self-registration, document image submission, one-driver-one-unit setup, and super-admin verification workflow. Database smoke test still requires applying the new driver verification migration. |
| 2026-07-24 | Admin dashboard | Added compact dashboard analytics plan: super admin sees system-wide stats, other admins see scoped stats, Recharts visualizes facility mix, role distribution, emergency status, fleet status, and audit activity. |
| 2026-07-24 | Admin dashboard | Added `/api/admin/analytics/overview` and rebuilt `/admin` with compact stats, approval notifications, and Recharts visualizations. API and web builds passed. |
| 2026-07-24 | Emergency ambulance | Expanded ambulance dashboard with overview charts, active/inactive GPS workflow, active-trip controls, service coverage, earnings, history, and completed-trip feedback. Verification pending after applying dashboard migration. |
