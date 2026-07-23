"use client";

import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export type AppActorType =
  | "super_admin"
  | "tenant_admin"
  | "facility_operator"
  | "doctor"
  | "patient"
  | "pharmacy_admin"
  | "ambulance_admin"
  | "blood_bank_admin";

export type FacilityType =
  | "hospital"
  | "clinic"
  | "pharmacy"
  | "lab"
  | "ambulance_unit"
  | "independent_vendor";

export type SessionRole = {
  id: string;
  role: AppActorType;
  tenant_id: string | null;
  facility_id: string | null;
  tenant_name: string | null;
  facility_name: string | null;
  facility_type: FacilityType | null;
  facility_city: string | null;
};

export type SessionContext = {
  profile: {
    id: string;
    tenant_id: string | null;
    facility_id: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    account_type?: string | null;
    age?: number | null;
    blood_group?: string | null;
    location?: string | null;
    preferred_city?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
  } | null;
  roles: SessionRole[];
};

export interface PendingSignup {
  actorType: AppActorType;
  signupMethod: "email_password" | "google" | "magic_link";
  onboardingSessionId?: string;
  nextPath: string;
  age?: number;
  bloodGroup?: string;
  location?: string;
}

export function getSupabaseBrowserClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase browser environment variables are missing.");
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
}

export function getActorType(user: User | null | undefined): AppActorType | null {
  const value = user?.user_metadata?.actorType;

  if (
    value === "super_admin" ||
    value === "patient" ||
    value === "tenant_admin" ||
    value === "facility_operator" ||
    value === "doctor" ||
    value === "pharmacy_admin" ||
    value === "ambulance_admin" ||
    value === "blood_bank_admin"
  ) {
    return value;
  }

  return null;
}

const PENDING_SIGNUP_KEY = "ehc.pendingSignup";

export function savePendingSignup(pendingSignup: PendingSignup) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(pendingSignup));
}

export function readPendingSignup(): PendingSignup | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PENDING_SIGNUP_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PENDING_SIGNUP_KEY);
}

export function getAuthRedirectPath(
  actorType: AppActorType,
  options?: { profileStepDone?: boolean },
) {
  if (actorType === "patient") {
    return options?.profileStepDone ? "/discover" : "/profile-completion";
  }

  if (actorType === "tenant_admin") {
    return "/admin/tenant-setup";
  }

  if (actorType === "doctor") {
    return "/doctor";
  }

  return "/admin";
}

export function getDashboardPath(actorType: AppActorType | null | undefined) {
  if (actorType === "patient") {
    return "/discover";
  }

  if (actorType === "doctor") {
    return "/doctor";
  }

  if (
    actorType === "super_admin" ||
    actorType === "tenant_admin" ||
    actorType === "facility_operator" ||
    actorType === "pharmacy_admin" ||
    actorType === "ambulance_admin" ||
    actorType === "blood_bank_admin"
  ) {
    return "/admin";
  }

  return "/login";
}

export function getPrimaryActorType(
  user: User | null | undefined,
  sessionContext: SessionContext | null,
): AppActorType | null {
  const rolePriority: AppActorType[] = [
    "super_admin",
    "tenant_admin",
    "doctor",
    "pharmacy_admin",
    "ambulance_admin",
    "blood_bank_admin",
    "facility_operator",
    "patient",
  ];
  const roles = new Set(sessionContext?.roles.map((item) => item.role) ?? []);

  for (const role of rolePriority) {
    if (roles.has(role)) {
      return role;
    }
  }

  return getActorType(user);
}

export function hasActiveSession(session: Session | null) {
  return Boolean(session?.access_token && session?.user);
}
