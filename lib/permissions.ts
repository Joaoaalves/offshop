import type { UserRole } from "@/types/roles";

/**
 * All available permissions in the platform.
 *
 * Naming: <domain>:<action>
 *   read  = view data
 *   write = create / update
 *   delete = remove records
 */
export type Permission =
  // Products
  | "products:read"
  | "products:write"
  | "products:delete"
  // Purchases dashboard & orders
  | "purchases:read"
  | "purchases:write"   // set order qty, classification, newCost
  | "purchases:execute" // confirm & send a purchase order
  // Purchase orders tracking
  | "orders:read"
  | "orders:write"      // confirm arrival, change dates
  // Suppliers
  | "suppliers:read"
  | "suppliers:write"
  // Mercado Livre
  | "ml:read"
  // Finance (costs, prices)
  | "finance:read"
  | "finance:write"     // sync costs, update prices
  // Ingest pipelines (external/tiny/ml)
  | "ingest:run"
  // Admin panel
  | "admin:read"
  | "admin:write";      // create / delete users

const ALL: Permission[] = [
  "products:read", "products:write", "products:delete",
  "purchases:read", "purchases:write", "purchases:execute",
  "orders:read", "orders:write",
  "suppliers:read", "suppliers:write",
  "ml:read",
  "finance:read", "finance:write",
  "ingest:run",
  "admin:read", "admin:write",
];

/**
 * Permission matrix per role.
 * Roles ordered from most to least privileged.
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /** Full access — platform owner / developer */
  admin: ALL,

  /** Automated pipelines, ingest jobs */
  system: [
    "products:read", "products:write",
    "purchases:read", "purchases:write",
    "orders:read", "orders:write",
    "suppliers:read",
    "ml:read",
    "finance:read", "finance:write",
    "ingest:run",
  ],

  /** Managers — all except admin:write */
  management: [
    "products:read", "products:write", "products:delete",
    "purchases:read", "purchases:write", "purchases:execute",
    "orders:read", "orders:write",
    "suppliers:read", "suppliers:write",
    "ml:read",
    "finance:read", "finance:write",
    "ingest:run",
    "admin:read",
  ],

  /** Sales team — visibility into products, ML and costs, no writes */
  commercial: [
    "products:read",
    "purchases:read",
    "orders:read",
    "suppliers:read",
    "ml:read",
    "finance:read",
  ],

  /** Operations — manages stock movements and purchase orders */
  operations: [
    "products:read", "products:write",
    "purchases:read", "purchases:write", "purchases:execute",
    "orders:read", "orders:write",
    "suppliers:read",
  ],

  /** Analysts — read-only across all domains */
  analyst: [
    "products:read",
    "purchases:read",
    "orders:read",
    "suppliers:read",
    "ml:read",
    "finance:read",
  ],

  /** Shipping — knows what arrived, what is pending */
  shipping: [
    "products:read",
    "orders:read", "orders:write",
    "purchases:read",
  ],

  /** Finance — full view of costs/prices, can sync */
  finance: [
    "products:read",
    "purchases:read",
    "orders:read",
    "suppliers:read",
    "finance:read", "finance:write",
  ],
};

/** Returns true if the given role has the requested permission. */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns the full permission list for a role. */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
