import { requireCurrentUser } from "./current-user";

export const DEMO_USER_EMAIL = "demo@finanzas.local";

export async function getDemoUser() {
  return requireCurrentUser();
}
