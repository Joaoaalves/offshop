import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import "@/models/AuditLog";

/**
 * Records a user action to the audit log.
 *
 * ALWAYS call without `await` — this is intentionally fire-and-forget
 * so it never adds latency to the API response.
 *
 * @example
 * logAction(req, "products:write", { id: productId });
 */
export function logAction(
  req: NextRequest,
  action: string,
  meta?: Record<string, unknown>,
): void {
  (async () => {
    try {
      const session = await auth(); // cached per request — no extra DB hit
      if (!session) return;

      await connectDB();

      // Dynamic import avoids pulling the model into Edge bundles
      const { AuditLog } = await import("@/models/AuditLog");

      await AuditLog.create({
        userId:    session.user.id,
        userName:  session.user.name,
        userEmail: session.user.email,
        method:    req.method,
        path:      req.nextUrl.pathname,
        action,
        resourceId: meta?.id as string | undefined,
        meta,
      });
    } catch {
      // Never surface audit errors to the caller
    }
  })();
}
