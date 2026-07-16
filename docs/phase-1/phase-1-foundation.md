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
- Phone OTP

Signup UX rule:
- Use step-by-step onboarding with `Next` and `Skip` controls.
- Patients are the main customer path and do not require an organization invite.
- Google login applies to patients as well as staff roles.

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

- `#194898` Sapphire
- `#5084D9`
- `#9BC0E8`
- `#EDEDEE`
- `#D9B100`

## What is implemented in this scaffold

- Monorepo structure for web, api, and mobile
- Next.js landing/dashboard shell
- Stepper-based onboarding UI concept
- Working patient-first signup screen wired to the API
- Working tenant and primary facility setup form wired to the API
- NestJS module boundaries for Phase 1
- Supabase migrations for tenants, facilities, profiles, roles, audit logs, and onboarding sessions

## Immediate next implementation slice

1. Install dependencies
2. Connect Supabase env vars
3. Implement real auth flows
4. Add tenant and facility creation forms
5. Persist onboarding progress
6. Add guarded admin dashboard routes
