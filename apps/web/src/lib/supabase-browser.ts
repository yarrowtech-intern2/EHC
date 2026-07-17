"use client";

import { createClient, type Session, type SupabaseClient, type User } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export type AppActorType = "patient" | "tenant_admin" | "facility_operator" | "doctor";

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
    value === "patient" ||
    value === "tenant_admin" ||
    value === "facility_operator" ||
    value === "doctor"
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

export function hasActiveSession(session: Session | null) {
  return Boolean(session?.access_token && session?.user);
}
