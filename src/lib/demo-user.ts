export const DEMO_USER_EMAIL = "demo@finanzas.local";

import { prisma } from "./prisma";

export async function getDemoUser() {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
  if (!user) throw new Error("Demo user not found. Run: npx prisma db seed");
  return user;
}
