export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "USER";
  isActive: boolean;
  preferredCurrency: string;
  dateFormat: string;
  theme: string;
}
