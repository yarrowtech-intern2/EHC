"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { apiRequest } from "@/lib/api";
import {
  getPrimaryActorType,
  getSupabaseBrowserClient,
  type AppActorType,
  type SessionContext,
} from "@/lib/supabase-browser";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  actorType: AppActorType | null;
  sessionContext: SessionContext | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const applySession = async (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.access_token) {
        setSessionContext(null);
        setLoading(false);
        return;
      }

      try {
        const context = await apiRequest<SessionContext>("/auth/session-context", {
          headers: {
            Authorization: `Bearer ${nextSession.access_token}`,
          },
        });
        setSessionContext(context);
      } catch {
        setSessionContext(null);
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      applySession(nextSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      actorType: getPrimaryActorType(user, sessionContext),
      sessionContext,
      loading,
    }),
    [loading, session, sessionContext, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
