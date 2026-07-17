"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { apiRequest } from "@/lib/api";
import {
  clearPendingSignup,
  getActorType,
  getAuthRedirectPath,
  getSupabaseBrowserClient,
  readPendingSignup,
} from "@/lib/supabase-browser";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token || !session.user) {
        router.replace("/login");
        return;
      }

      const pendingSignup = readPendingSignup();
      const actorType = getActorType(session.user) ?? pendingSignup?.actorType ?? "patient";

      try {
        await apiRequest("/auth/sync-profile", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: {
            actorType,
            onboardingSessionId: pendingSignup?.onboardingSessionId,
            age: pendingSignup?.age,
            bloodGroup: pendingSignup?.bloodGroup,
            location: pendingSignup?.location,
          },
        });
      } finally {
        clearPendingSignup();
      }

      router.replace(
        pendingSignup?.nextPath && pendingSignup.nextPath !== "/profile-completion"
          ? pendingSignup.nextPath
          : getAuthRedirectPath(actorType),
      );
    };

    run().catch(() => {
      router.replace("/login");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-full bg-white/75 px-5 py-3 text-sm text-body shadow-card">
        Finalizing sign in...
      </div>
    </main>
  );
}
