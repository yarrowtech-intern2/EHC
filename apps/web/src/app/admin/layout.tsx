import { AuthGuard } from "@/components/guards/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedActors={["tenant_admin", "facility_operator"]}>
      {children}
    </AuthGuard>
  );
}
