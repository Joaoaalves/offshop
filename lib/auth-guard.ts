import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@/types/roles";

/**
 * Verifies the session and checks the required permission.
 * Returns `null` if the check passes (caller can proceed).
 * Returns a `NextResponse` error if the check fails (caller should return it).
 *
 * @example
 * export async function GET() {
 *   const deny = await requirePermission("products:read");
 *   if (deny) return deny;
 *   ...
 * }
 */
export async function requirePermission(
  permission: Permission,
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.user.role as UserRole, permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
