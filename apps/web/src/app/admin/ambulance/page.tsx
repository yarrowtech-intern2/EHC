"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertCircle,
  Ambulance,
  BarChart3,
  CheckCircle2,
  Clock3,
  History,
  IndianRupee,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Route,
  Star,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardHero, DashboardPanel, DashboardStatCard } from "@/components/dashboard-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { apiRequest } from "@/lib/api";

type AmbulanceUnit = {
  id: string;
  facilityId: string | null;
  facilityName: string | null;
  facilityCity: string | null;
  driverUserId: string | null;
  vehicleNumber: string;
  driverName: string | null;
  driverPhone: string | null;
  status: "offline" | "available" | "busy" | "maintenance";
  verificationStatus: "pending_verification" | "approved" | "rejected";
  verificationNotes: string | null;
  serviceCodes: AmbulanceServiceCode[];
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationAt: string | null;
};

type EmergencyRequest = {
  id: string;
  patientName: string;
  patientPhone: string;
  pickupAddress: string | null;
  pickupLatitude: number;
  pickupLongitude: number;
  status: "requested" | "accepted" | "en_route" | "arrived" | "transporting" | "completed" | "cancelled";
  facilityId: string | null;
  ambulanceUnitId: string | null;
  acceptedAt: string | null;
  statusUpdatedAt: string;
  completedAt: string | null;
  createdAt: string;
  estimatedDistanceKm: number | null;
  distanceFeeAmount: number;
  serviceFeeAmount: number;
  platformFeeAmount: number;
  totalFareAmount: number;
  ratingScore: number | null;
  feedbackComment: string | null;
  ratedAt: string | null;
  ambulanceUnit: AmbulanceUnit | null;
};

type NearbyRequest = EmergencyRequest & {
  nearestUnit: AmbulanceUnit | null;
  distanceKm: number;
};

type DispatchData = {
  active: EmergencyRequest[];
  nearby: NearbyRequest[];
  units: AmbulanceUnit[];
  radiusKm: number;
};

type DashboardData = {
  overview: {
    activeTrips: number;
    completedTrips: number;
    cancelledTrips: number;
    totalEarnings: number;
    averageRating: number;
    availableUnits: number;
    inactiveUnits: number;
    servicesCovered: number;
    facilityScope: number;
  };
  units: AmbulanceUnit[];
  servicesCovered: Array<{ code: AmbulanceServiceCode; label: string; unitCount: number }>;
  activeTrips: EmergencyRequest[];
  history: EmergencyRequest[];
  earnings: {
    total: number;
    completedTrips: number;
    averageFare: number;
    rows: Array<{
      id: string;
      patientName: string;
      completedAt: string | null;
      totalFareAmount: number;
      estimatedDistanceKm: number | null;
    }>;
  };
  feedback: Array<{
    id: string;
    patientName: string;
    ratingScore: number;
    feedbackComment: string | null;
    ratedAt: string | null;
  }>;
};

type AmbulanceServiceCode =
  | "emergency_ambulance"
  | "patient_transfer"
  | "inter_hospital_transfer"
  | "icu_ambulance"
  | "oxygen_support"
  | "dead_body_transport";

type TabId = "overview" | "incoming" | "map" | "history" | "services" | "earnings" | "feedback" | "fleet";

const tabs: Array<{ id: TabId; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "incoming", label: "Incoming", icon: Clock3 },
  { id: "map", label: "Map", icon: MapIcon },
  { id: "history", label: "History", icon: History },
  { id: "services", label: "Services", icon: Route },
  { id: "earnings", label: "Earnings", icon: IndianRupee },
  { id: "feedback", label: "Feedback", icon: Star },
  { id: "fleet", label: "Fleet", icon: Ambulance },
];

const serviceOptions: Array<{ code: AmbulanceServiceCode; label: string }> = [
  { code: "emergency_ambulance", label: "Emergency ambulance" },
  { code: "patient_transfer", label: "Patient transfer" },
  { code: "inter_hospital_transfer", label: "Inter-hospital transfer" },
  { code: "icu_ambulance", label: "ICU ambulance" },
  { code: "oxygen_support", label: "Oxygen support" },
  { code: "dead_body_transport", label: "Dead body transport" },
];

const emptyDispatchData: DispatchData = {
  active: [],
  nearby: [],
  units: [],
  radiusKm: 5,
};

const emptyDashboardData: DashboardData = {
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

const nextStatuses: Array<EmergencyRequest["status"]> = [
  "en_route",
  "arrived",
  "transporting",
  "completed",
  "cancelled",
];

const palette = ["#0057FF", "#16A34A", "#EF4444", "#D9B100", "#0891B2", "#7C3AED"];

export default function AmbulanceAdminPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");
  const [dispatch, setDispatch] = useState<DispatchData>(emptyDispatchData);
  const [dashboard, setDashboard] = useState<DashboardData>(emptyDashboardData);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const headers = useMemo(
    () =>
      session?.access_token
        ? {
            Authorization: `Bearer ${session.access_token}`,
          }
        : undefined,
    [session?.access_token],
  );

  const units = dashboard.units.length ? dashboard.units : dispatch.units;
  const selectedMapTrip = dispatch.active[0] ?? dispatch.nearby[0] ?? dashboard.history[0] ?? null;
  const activeUnitCount = units.filter((unit) => unit.status === "available").length;
  const chartData = [
    { label: "Active", value: dashboard.overview.activeTrips },
    { label: "Completed", value: dashboard.overview.completedTrips },
    { label: "Cancelled", value: dashboard.overview.cancelledTrips },
  ];
  const unitStatusData = [
    { label: "Available", value: dashboard.overview.availableUnits },
    { label: "Inactive", value: dashboard.overview.inactiveUnits },
    { label: "Busy", value: units.filter((unit) => unit.status === "busy").length },
  ];

  useEffect(() => {
    if (!headers) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        const [nextDispatch, nextDashboard] = await Promise.all([
          apiRequest<DispatchData>("/emergency-ambulance/operator/requests?radiusKm=5", { headers }),
          apiRequest<DashboardData>("/emergency-ambulance/operator/dashboard", { headers }),
        ]);

        if (cancelled) {
          return;
        }

        setDispatch(nextDispatch);
        setDashboard(nextDashboard);
        setFacilityId((current) => current || nextDashboard.units[0]?.facilityId || "");
        setMessage(null);
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Could not load ambulance dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    const interval = window.setInterval(load, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [headers]);

  async function reload() {
    if (!headers) {
      return;
    }

    setLoading(true);
    try {
      const [nextDispatch, nextDashboard] = await Promise.all([
        apiRequest<DispatchData>("/emergency-ambulance/operator/requests?radiusKm=5", { headers }),
        apiRequest<DashboardData>("/emergency-ambulance/operator/dashboard", { headers }),
      ]);
      setDispatch(nextDispatch);
      setDashboard(nextDashboard);
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not refresh ambulance dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function createUnit() {
    if (!headers || !facilityId || !vehicleNumber.trim()) {
      setMessage("Ambulance facility and vehicle number are required.");
      return;
    }

    setSaving(true);
    try {
      await apiRequest("/emergency-ambulance/units", {
        method: "POST",
        headers,
        body: {
          facilityId,
          vehicleNumber,
          driverName: driverName || undefined,
          driverPhone: driverPhone || undefined,
        },
      });
      setVehicleNumber("");
      setDriverName("");
      setDriverPhone("");
      await reload();
      setMessage("Ambulance unit added.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add ambulance unit.");
    } finally {
      setSaving(false);
    }
  }

  async function setUnitAvailability(unit: AmbulanceUnit, active: boolean) {
    if (!headers) {
      return;
    }

    setSaving(true);

    if (!active) {
      try {
        await apiRequest(`/emergency-ambulance/units/${unit.id}/availability`, {
          method: "PATCH",
          headers,
          body: { active: false },
        });
        await reload();
        setMessage("Ambulance set inactive.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not update availability.");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!navigator.geolocation) {
      setSaving(false);
      setMessage("Location sharing is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiRequest(`/emergency-ambulance/units/${unit.id}/availability`, {
            method: "PATCH",
            headers,
            body: {
              active: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          await reload();
          setMessage("Ambulance is active with precise GPS.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Could not set ambulance active.");
        } finally {
          setSaving(false);
        }
      },
      () => {
        setSaving(false);
        setMessage("Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function shareUnitLocation(unit: AmbulanceUnit) {
    if (!headers) {
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Location sharing is not available in this browser.");
      return;
    }

    setSaving(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiRequest(`/emergency-ambulance/units/${unit.id}/location`, {
            method: "PATCH",
            headers,
            body: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          await reload();
          setMessage("Precise ambulance GPS updated.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Could not update ambulance GPS.");
        } finally {
          setSaving(false);
        }
      },
      () => {
        setSaving(false);
        setMessage("Location permission was denied.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function updateUnitServices(unit: AmbulanceUnit, serviceCode: AmbulanceServiceCode) {
    if (!headers) {
      return;
    }

    const currentCodes = new Set(unit.serviceCodes);
    if (currentCodes.has(serviceCode)) {
      currentCodes.delete(serviceCode);
    } else {
      currentCodes.add(serviceCode);
    }

    setSaving(true);
    try {
      await apiRequest(`/emergency-ambulance/units/${unit.id}/services`, {
        method: "PATCH",
        headers,
        body: {
          serviceCodes: Array.from(currentCodes),
        },
      });
      await reload();
      setMessage("Services covered updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update services.");
    } finally {
      setSaving(false);
    }
  }

  async function acceptRequest(requestId: string, unitId: string) {
    if (!headers) {
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/emergency-ambulance/requests/${requestId}/accept`, {
        method: "POST",
        headers,
        body: { unitId },
      });
      await reload();
      setMessage("Request accepted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not accept request.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRequestStatus(requestId: string, status: EmergencyRequest["status"]) {
    if (!headers) {
      return;
    }

    setSaving(true);
    try {
      await apiRequest(`/emergency-ambulance/requests/${requestId}/status`, {
        method: "PATCH",
        headers,
        body: { status },
      });
      await reload();
      setMessage(`Request marked ${formatStatus(status)}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <DashboardHero
        eyebrow="Ambulance service"
        title="Ambulance dashboard"
        description="Manage live availability, incoming requests, trip history, covered services, earnings, ratings, and map view."
        actions={
          <button
            type="button"
            onClick={reload}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      >
        {message ? (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm text-[#9a3412]">
            <AlertCircle className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard icon={Clock3} label="Incoming requests" value={loading ? "..." : String(dispatch.nearby.length)} tone="blue" />
          <DashboardStatCard icon={Ambulance} label="Active trips" value={loading ? "..." : String(dashboard.overview.activeTrips)} tone="green" />
          <DashboardStatCard icon={CheckCircle2} label="Active ambulances" value={loading ? "..." : String(activeUnitCount)} tone="green" />
          <DashboardStatCard icon={IndianRupee} label="Earnings" value={loading ? "..." : formatCurrency(dashboard.overview.totalEarnings)} tone="slate" />
        </div>
      </DashboardHero>

      <div className="flex gap-2 overflow-x-auto rounded-[22px] bg-white p-2 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
                tab === item.id ? "bg-[#0057FF] text-white" : "bg-[#f8f7f4] text-slate-600 hover:text-ink"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <OverviewTab dashboard={dashboard} chartData={chartData} unitStatusData={unitStatusData} />
      ) : null}
      {tab === "incoming" ? (
        <IncomingTab
          dispatch={dispatch}
          units={units}
          saving={saving}
          onAccept={acceptRequest}
          onStatusChange={updateRequestStatus}
        />
      ) : null}
      {tab === "map" ? <MapTab subject={selectedMapTrip} /> : null}
      {tab === "history" ? <HistoryTab history={dashboard.history} /> : null}
      {tab === "services" ? (
        <ServicesTab units={units} saving={saving} onToggleService={updateUnitServices} />
      ) : null}
      {tab === "earnings" ? <EarningsTab dashboard={dashboard} /> : null}
      {tab === "feedback" ? <FeedbackTab feedback={dashboard.feedback} averageRating={dashboard.overview.averageRating} /> : null}
      {tab === "fleet" ? (
        <FleetTab
          units={units}
          saving={saving}
          vehicleNumber={vehicleNumber}
          driverName={driverName}
          driverPhone={driverPhone}
          facilityId={facilityId}
          onVehicleNumberChange={setVehicleNumber}
          onDriverNameChange={setDriverName}
          onDriverPhoneChange={setDriverPhone}
          onFacilityIdChange={setFacilityId}
          onCreateUnit={createUnit}
          onSetAvailability={setUnitAvailability}
          onShareLocation={shareUnitLocation}
        />
      ) : null}
    </div>
  );
}

function OverviewTab({
  dashboard,
  chartData,
  unitStatusData,
}: {
  dashboard: DashboardData;
  chartData: Array<{ label: string; value: number }>;
  unitStatusData: Array<{ label: string; value: number }>;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <DashboardPanel eyebrow="Analytics" title="Trip status">
        <ChartFrame empty={chartData.every((item) => item.value === 0)}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: -24, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={palette[index % palette.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </DashboardPanel>

      <DashboardPanel eyebrow="Fleet analytics" title="Unit status">
        <ChartFrame empty={unitStatusData.every((item) => item.value === 0)}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={unitStatusData} dataKey="value" nameKey="label" innerRadius={54} outerRadius={88} paddingAngle={3}>
                {unitStatusData.map((_, index) => (
                  <Cell key={index} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>
      </DashboardPanel>

      <DashboardPanel eyebrow="Summary" title="Operational stats">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="Completed trips" value={String(dashboard.overview.completedTrips)} />
          <InfoTile label="Average fare" value={formatCurrency(dashboard.earnings.averageFare)} />
          <InfoTile label="Average rating" value={`${dashboard.overview.averageRating || 0}/5`} />
          <InfoTile label="Services covered" value={String(dashboard.overview.servicesCovered)} />
        </div>
      </DashboardPanel>
    </section>
  );
}

function IncomingTab({
  dispatch,
  units,
  saving,
  onAccept,
  onStatusChange,
}: {
  dispatch: DispatchData;
  units: AmbulanceUnit[];
  saving: boolean;
  onAccept: (requestId: string, unitId: string) => void;
  onStatusChange: (requestId: string, status: EmergencyRequest["status"]) => void;
}) {
  const availableUnits = units.filter((unit) => unit.status === "available");

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1fr]">
      <DashboardPanel eyebrow="Active trips" title="Driver workflow">
        <div className="space-y-3">
          {dispatch.active.length === 0 ? <EmptyLine text="No active ambulance trips right now." /> : null}
          {dispatch.active.map((request) => (
            <RequestCard key={request.id} request={request}>
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={saving || request.status === status}
                  onClick={() => onStatusChange(request.id, status)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition disabled:opacity-60 ${
                    status === "completed"
                      ? "bg-[#16a34a] text-white"
                      : status === "cancelled"
                        ? "bg-white text-[#b91c1c]"
                        : "bg-white text-ink"
                  }`}
                >
                  {formatStatus(status)}
                </button>
              ))}
            </RequestCard>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel eyebrow="Incoming requests" title="First accept wins">
        <div className="space-y-3">
          {dispatch.nearby.length === 0 ? <EmptyLine text="No nearby emergency requests are waiting." /> : null}
          {dispatch.nearby.map((request) => (
            <RequestCard key={request.id} request={request}>
              {availableUnits.slice(0, 3).map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  disabled={saving}
                  onClick={() => onAccept(request.id, unit.id)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-[#ef4444] px-4 text-xs font-semibold text-white transition hover:bg-[#dc2626] disabled:opacity-60"
                >
                  <Ambulance className="h-4 w-4" />
                  Accept with {unit.vehicleNumber}
                </button>
              ))}
            </RequestCard>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

function MapTab({ subject }: { subject: EmergencyRequest | null }) {
  return (
    <DashboardPanel eyebrow="Map" title="Pickup and route view">
      <div className="overflow-hidden rounded-2xl bg-[#dedede]">
        {subject ? (
          <iframe
            title="Emergency pickup map"
            src={buildOsmEmbedUrl(subject.pickupLatitude, subject.pickupLongitude)}
            className="h-[520px] w-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-[520px] items-center justify-center px-6 text-center text-sm text-slate-500">
            No live pickup location available.
          </div>
        )}
      </div>
      {subject ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          Pickup: {subject.pickupAddress || formatCoordinates(subject.pickupLatitude, subject.pickupLongitude)}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-slate-500">Map data OpenStreetMap contributors.</p>
    </DashboardPanel>
  );
}

function HistoryTab({ history }: { history: EmergencyRequest[] }) {
  return (
    <DashboardPanel eyebrow="History" title="Completed and cancelled trips">
      <div className="grid gap-3 lg:grid-cols-2">
        {history.length === 0 ? <EmptyLine text="No trip history yet." /> : null}
        {history.map((request) => (
          <RequestCard key={request.id} request={request}>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-ink">
              {formatCurrency(request.totalFareAmount)}
            </span>
          </RequestCard>
        ))}
      </div>
    </DashboardPanel>
  );
}

function ServicesTab({
  units,
  saving,
  onToggleService,
}: {
  units: AmbulanceUnit[];
  saving: boolean;
  onToggleService: (unit: AmbulanceUnit, serviceCode: AmbulanceServiceCode) => void;
}) {
  return (
    <DashboardPanel eyebrow="Services covered" title="Ambulance service coverage">
      <div className="grid gap-4 lg:grid-cols-2">
        {units.length === 0 ? <EmptyLine text="No ambulance units registered." /> : null}
        {units.map((unit) => (
          <div key={unit.id} className="rounded-2xl bg-[#dedede] p-4">
            <p className="text-sm font-semibold text-ink">{unit.vehicleNumber}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {serviceOptions.map((service) => {
                const active = unit.serviceCodes.includes(service.code);
                return (
                  <button
                    key={service.code}
                    type="button"
                    disabled={saving}
                    onClick={() => onToggleService(unit, service.code)}
                    className={`rounded-full px-3 py-2 text-left text-xs font-semibold transition ${
                      active ? "bg-[#0057FF] text-white" : "bg-white text-slate-600"
                    }`}
                  >
                    {service.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function EarningsTab({ dashboard }: { dashboard: DashboardData }) {
  return (
    <DashboardPanel eyebrow="Earnings" title="Distance + service fee + platform fee">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <InfoTile label="Total earnings" value={formatCurrency(dashboard.earnings.total)} />
        <InfoTile label="Completed trips" value={String(dashboard.earnings.completedTrips)} />
        <InfoTile label="Average fare" value={formatCurrency(dashboard.earnings.averageFare)} />
      </div>
      <div className="space-y-3">
        {dashboard.earnings.rows.length === 0 ? <EmptyLine text="No completed trips for earnings yet." /> : null}
        {dashboard.earnings.rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#dedede] px-4 py-3 text-sm">
            <span>
              <span className="block font-semibold text-ink">{row.patientName}</span>
              <span className="text-xs text-slate-500">
                {row.completedAt ? formatDate(row.completedAt) : "Completion time missing"} - {row.estimatedDistanceKm ?? 0} km
              </span>
            </span>
            <span className="font-semibold text-ink">{formatCurrency(row.totalFareAmount)}</span>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function FeedbackTab({
  feedback,
  averageRating,
}: {
  feedback: DashboardData["feedback"];
  averageRating: number;
}) {
  return (
    <DashboardPanel eyebrow="Ratings and feedback" title={`Average rating ${averageRating || 0}/5`}>
      <div className="grid gap-3 lg:grid-cols-2">
        {feedback.length === 0 ? <EmptyLine text="No completed-trip feedback yet." /> : null}
        {feedback.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[#dedede] p-4 text-sm">
            <p className="font-semibold text-ink">{item.patientName}</p>
            <p className="mt-1 text-xs text-slate-500">
              {item.ratingScore}/5 stars{" "}
              {item.ratedAt ? formatDate(item.ratedAt) : ""}
            </p>
            <p className="mt-3 text-slate-600">{item.feedbackComment || "No written feedback."}</p>
          </div>
        ))}
      </div>
    </DashboardPanel>
  );
}

function FleetTab({
  units,
  saving,
  vehicleNumber,
  driverName,
  driverPhone,
  facilityId,
  onVehicleNumberChange,
  onDriverNameChange,
  onDriverPhoneChange,
  onFacilityIdChange,
  onCreateUnit,
  onSetAvailability,
  onShareLocation,
}: {
  units: AmbulanceUnit[];
  saving: boolean;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  facilityId: string;
  onVehicleNumberChange: (value: string) => void;
  onDriverNameChange: (value: string) => void;
  onDriverPhoneChange: (value: string) => void;
  onFacilityIdChange: (value: string) => void;
  onCreateUnit: () => void;
  onSetAvailability: (unit: AmbulanceUnit, active: boolean) => void;
  onShareLocation: (unit: AmbulanceUnit) => void;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
      <DashboardPanel eyebrow="Fleet / status" title="Active and inactive ambulances">
        <div className="space-y-3">
          {units.length === 0 ? <EmptyLine text="No ambulance units are registered in your scope." /> : null}
          {units.map((unit) => (
            <div key={unit.id} className="rounded-2xl bg-[#dedede] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{unit.vehicleNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {unit.driverName || "Driver not named"} - {formatStatus(unit.status)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {unit.currentLatitude && unit.currentLongitude
                      ? formatCoordinates(unit.currentLatitude, unit.currentLongitude)
                      : "Location not shared"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Verification: {formatStatus(unit.verificationStatus)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unit.status === "available" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onSetAvailability(unit, false)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-ink transition disabled:opacity-60"
                    >
                      <ToggleLeft className="h-4 w-4" />
                      Set inactive
                    </button>
                  ) : unit.status === "busy" ? null : (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onSetAvailability(unit, true)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[#16a34a] px-4 text-xs font-semibold text-white transition disabled:opacity-60"
                    >
                      <ToggleRight className="h-4 w-4" />
                      Go active
                    </button>
                  )}
                  {unit.status !== "offline" && unit.status !== "maintenance" ? (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => onShareLocation(unit)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0057FF] px-4 text-xs font-semibold text-white transition disabled:opacity-60"
                    >
                      <LocateFixed className="h-4 w-4" />
                      Update GPS
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DashboardPanel>

      <DashboardPanel eyebrow="Setup" title="Add ambulance unit">
        <div className="grid gap-3">
          <select
            value={facilityId}
            onChange={(event) => onFacilityIdChange(event.target.value)}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none"
          >
            <option value="">Ambulance facility</option>
            {Array.from(new Map(units.map((unit) => [unit.facilityId, unit])).values())
              .filter((unit) => unit.facilityId)
              .map((unit) => (
                <option key={unit.facilityId!} value={unit.facilityId!}>
                  {unit.facilityName || unit.facilityId}
                </option>
              ))}
          </select>
          <input value={vehicleNumber} onChange={(event) => onVehicleNumberChange(event.target.value)} placeholder="Vehicle number" className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none" />
          <input value={driverName} onChange={(event) => onDriverNameChange(event.target.value)} placeholder="Driver name" className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none" />
          <input value={driverPhone} onChange={(event) => onDriverPhoneChange(event.target.value)} placeholder="Driver phone" className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none" />
          <button type="button" disabled={saving} onClick={onCreateUnit} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0057FF] px-4 text-sm font-semibold text-white disabled:opacity-60">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </DashboardPanel>
    </section>
  );
}

function RequestCard({
  request,
  children,
}: {
  request: EmergencyRequest | NearbyRequest;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#dedede] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{request.patientName}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            {request.patientPhone}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {request.pickupAddress || formatCoordinates(request.pickupLatitude, request.pickupLongitude)}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">
          {"distanceKm" in request ? `${request.distanceKm.toFixed(1)} km` : formatStatus(request.status)}
        </span>
      </div>
      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#dedede] px-4 py-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ChartFrame({ children, empty }: { children: React.ReactNode; empty: boolean }) {
  return (
    <div className="h-[260px] rounded-2xl bg-[#f8f7f4] p-3">
      {empty ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">No chart data yet.</div>
      ) : (
        children
      )}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div className="rounded-2xl bg-[#dedede] px-4 py-4 text-sm text-slate-600">{text}</div>;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCoordinates(latitude: number, longitude: number) {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildOsmEmbedUrl(latitude: number, longitude: number) {
  const delta = 0.012;
  const left = longitude - delta;
  const right = longitude + delta;
  const top = latitude + delta;
  const bottom = latitude - delta;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;
}
