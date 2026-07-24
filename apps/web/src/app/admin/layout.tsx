import { AuthGuard } from "@/components/guards/auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard
      allowedActors={[
        "super_admin",
        "tenant_admin",
        "facility_operator",
        "pharmacy_admin",
        "ambulance_admin",
        "ambulance_driver",
        "blood_bank_admin",
      ]}
    >
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
