"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

type AllowedActor = "patient" | "tenant_admin" | "facility_operator" | "doctor";

export function AuthGuard({
  children,
  allowedActors,
}: {
  children: React.ReactNode;
  allowedActors?: AllowedActor[];
}) {
  const { actorType, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedActors && actorType && !allowedActors.includes(actorType)) {
      router.replace(actorType === "patient" ? "/profile-completion" : "/");
    }
  }, [actorType, allowedActors, loading, pathname, router, user]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-full bg-white/70 px-5 py-3 text-sm text-body shadow-card">
          Loading session...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedActors && actorType && !allowedActors.includes(actorType)) {
    return null;
  }

  return <>{children}</>;
}
