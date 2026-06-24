import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  return <>{children}</>;
}
