export type UserRole =
  | "admin"
  | "system"
  | "management"
  | "commercial"
  | "operations"
  | "analyst"
  | "shipping"
  | "finance";

export const USER_ROLES: UserRole[] = [
  "admin",
  "system",
  "management",
  "commercial",
  "operations",
  "analyst",
  "shipping",
  "finance",
];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  system: "Sistema",
  management: "Gestão",
  commercial: "Comercial",
  operations: "Operação",
  analyst: "Analista",
  shipping: "Expedição",
  finance: "Financeiro",
};
