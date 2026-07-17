# Phase 1 Foundation

## Locked decisions

- Date locked: July 16, 2026
- Apps: `web + api + mobile`
- Frontend: `Next.js + TypeScript + Tailwind CSS + shadcn/ui-ready patterns`
- Backend: `NestJS + Supabase`
- Package manager: `npm`
- Next.js App Router: `yes`
- TypeScript strict mode: `yes`

## Tenant and facility model

- A tenant represents the healthcare organization.
- Hospitals, clinics, pharmacies, labs, and ambulance units belong to that tenant as facilities.
- Small vendors are still supported by using either:
  - a real `small_vendor` tenant category, and
  - a single `independent_vendor` facility under that tenant when needed.

This keeps the data model consistent for both enterprise groups and small operators that serve patients directly.

## Phase 1 scope

- Authentication foundation
- Multi-method signup orchestration
- Tenant creation
- Facility creation
- Base roles
- Admin dashboard shell
- Audit log foundation
- Mobile-first visual system

## Auth methods to support

- Email and password
- Google social login
- Magic link
- Phone OTP later, not in the current Phase 1 implementation

Signup UX rule:
- Use step-by-step onboarding with `Next` and `Skip` controls.
- Patients are the main customer path and do not require an organization invite.
- Google login applies to patients as well as staff roles.
- Patient post-signup flow is: `profile completion -> facility discovery / booking`
- Tenant admins can create tenants immediately after self-signup in the current Phase 1 flow.
- Patients are independent customer accounts and are not attached to a tenant by default.

## Base roles

- `super_admin`
- `tenant_admin`
- `doctor`
- `patient`
- `pharmacy_admin`
- `ambulance_admin`
- `blood_bank_admin`

## UI direction

- Modern
- Minimal
- Patient-friendly
- Graphical and easy to understand
- Mobile-first
- Responsive on all screens

## Brand palette

- `#759DC4` Title and highlight blue
- `#5F86AE` Supporting darker blue
- `#93B4D3` Light accent blue
- `#EFEFEB` Background neutral
- `#D9B100`

## What is implemented in this scaffold

- Monorepo structure for web, api, and mobile
- Next.js landing/dashboard shell
- Stepper-based onboarding UI concept
- Working patient-first signup screen wired to the API
- Working tenant and primary facility setup form wired to the API
- Real Supabase client auth for email/password, Google, and magic link
- Client-side auth session provider and admin route guard
- Patient profile completion screen and facility discovery screen
- NestJS module boundaries for Phase 1
- Supabase migrations for tenants, facilities, profiles, roles, audit logs, and onboarding sessions

## Immediate next implementation slice

1. Install dependencies
2. Connect Supabase env vars
3. Implement real auth flows
4. Add tenant and facility creation forms
5. Persist onboarding progress
6. Add guarded admin dashboard routes
