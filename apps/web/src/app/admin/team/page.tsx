"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldPlus, Users } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type Tenant = {
  id: string;
  display_name: string;
  category: string;
};

type Facility = {
  id: string;
  tenant_id: string;
  name: string;
  type: string;
  city: string | null;
};

type Member = {
  id: string;
  user_id: string;
  tenant_id: string | null;
  facility_id: string | null;
  role: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  tenant_name: string | null;
  facility_name: string | null;
};

export default function AdminTeamPage() {
  const { actorType, session } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [form, setForm] = useState({
    tenantId: "",
    facilityId: "",
    email: "",
    role: "doctor",
  });
  const canAssignRoles = actorType === "tenant_admin";

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    const headers = {
      Authorization: `Bearer ${session.access_token}`,
    };

    Promise.all([
      apiRequest<Tenant[]>("/tenants/mine", { headers }),
      apiRequest<Facility[]>("/facilities/mine", { headers }),
      apiRequest<string[]>("/users/roles"),
    ])
      .then(([tenantData, facilityData, roleData]) => {
        setTenants(tenantData);
        setFacilities(facilityData);
        setRoles(roleData.filter((role) => role !== "patient" && role !== "super_admin"));

        if (tenantData[0]) {
          setForm((current) => ({ ...current, tenantId: tenantData[0].id }));
        }
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load team setup data."),
      );
  }, [session?.access_token]);

  const visibleFacilities = useMemo(
    () => facilities.filter((facility) => facility.tenant_id === form.tenantId),
    [facilities, form.tenantId],
  );
  const visibleMembers = useMemo(() => {
    if (
      actorType === "pharmacy_admin" ||
      actorType === "ambulance_admin" ||
      actorType === "blood_bank_admin"
    ) {
      return members.filter((member) => member.role === actorType);
    }

    return members;
  }, [actorType, members]);

  useEffect(() => {
    if (!form.tenantId) {
      return;
    }

    if (form.facilityId && !visibleFacilities.find((facility) => facility.id === form.facilityId)) {
      setForm((current) => ({ ...current, facilityId: "" }));
    }
  }, [form.facilityId, form.tenantId, visibleFacilities]);

  useEffect(() => {
    if (!form.tenantId) {
      return;
    }

    setLoadingMembers(true);
    setMessage(null);

    apiRequest<Member[]>(
      `/users/members?tenantId=${encodeURIComponent(form.tenantId)}${
        form.facilityId ? `&facilityId=${encodeURIComponent(form.facilityId)}` : ""
      }`,
      {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      },
    )
      .then(setMembers)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Could not load members."),
      )
      .finally(() => setLoadingMembers(false));
  }, [form.facilityId, form.tenantId, session?.access_token]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.tenantId) {
      setMessage("Select a tenant first.");
      return;
    }

    setMessage(null);

    try {
      await apiRequest("/users/assign-role", {
        method: "POST",
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
        body: {
          email: form.email,
          role: form.role,
          tenantId: form.tenantId,
          facilityId: form.facilityId || undefined,
        },
      });

      setMessage("Member role assigned successfully.");
      setForm((current) => ({ ...current, email: "" }));

      const refreshed = await apiRequest<Member[]>(
        `/users/members?tenantId=${encodeURIComponent(form.tenantId)}${
          form.facilityId ? `&facilityId=${encodeURIComponent(form.facilityId)}` : ""
        }`,
        {
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : undefined,
        },
      );
      setMembers(refreshed);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not assign role.");
    }
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand">Team management</p>
            <h1 className="mt-2 text-3xl font-bold text-heading">Tenant staff and role assignments</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-body">
              Assign existing registered users into operational roles so slots, appointments, and
              doctor workflows can be managed cleanly.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-3xl bg-white/70 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ShieldPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">
                  {canAssignRoles ? "Assign role" : "Roster scope"}
                </p>
                <h2 className="text-xl font-semibold text-heading">
                  {canAssignRoles ? "Map staff to a tenant or facility" : "Role-specific team access"}
                </h2>
              </div>
            </div>

            {canAssignRoles ? (
              <form className="mt-6 grid gap-4" onSubmit={submit}>
                <label className="text-sm font-medium text-heading">
                  Tenant
                  <select
                    value={form.tenantId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tenantId: event.target.value,
                        facilityId: "",
                      }))
                    }
                    className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  >
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.display_name} ({tenant.category})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-heading">
                  Facility
                  <select
                    value={form.facilityId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, facilityId: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  >
                    <option value="">Tenant-wide role</option>
                    {visibleFacilities.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name} ({facility.type})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-heading">
                  Staff email
                  <input
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    placeholder="doctor@ehc.example"
                    className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  />
                </label>

                <label className="text-sm font-medium text-heading">
                  Role
                  <select
                    value={form.role}
                    onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
                    className="mt-2 w-full rounded-[14px] border border-border bg-white/80 px-4 py-3 text-sm text-heading outline-none focus:border-brand"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                {message ? (
                  <div className="rounded-2xl bg-skywash/30 px-4 py-3 text-sm text-heading">
                    {message}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-ambercare px-6 py-3 text-sm font-semibold text-white"
                  >
                    Assign member role
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6 rounded-2xl bg-[#f8f7f4] px-4 py-4 text-sm leading-6 text-body">
                Your role can review the roster for its own service scope. Role assignment is limited
                to tenant admins in the current backend access rules.
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white/70 p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ambercare/30 text-heading">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-brand">Current members</p>
                <h2 className="text-xl font-semibold text-heading">Assigned staff roster</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {loadingMembers ? (
                <div className="rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                  Loading members...
                </div>
              ) : null}

              {!loadingMembers && visibleMembers.length === 0 ? (
                <div className="rounded-2xl bg-skywash/25 px-4 py-4 text-sm text-body">
                  No member roles assigned yet for this selection.
                </div>
              ) : null}

              {visibleMembers.map((member) => (
                <article key={member.id} className="rounded-2xl border border-border bg-white/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-heading">
                        {member.full_name || member.email || "Staff user"}
                      </h3>
                      <p className="mt-1 text-sm text-body">
                        {member.email || member.phone || "No contact details"}
                      </p>
                    </div>
                    <span className="rounded-full bg-skywash/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-heading">
                      {member.role}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-body">
                    <div>{member.tenant_name || "No tenant name"}</div>
                    <div>{member.facility_name || "Tenant-wide assignment"}</div>
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                      Assigned on {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
