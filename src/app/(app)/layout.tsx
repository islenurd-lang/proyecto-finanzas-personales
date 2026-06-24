import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import AppLayout from "@/components/layout/app-layout";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "SUPER_ADMIN") redirect("/admin");

  return <AppLayout userName={user.name} userEmail={user.email} userRole={user.role}>{children}</AppLayout>;
}
