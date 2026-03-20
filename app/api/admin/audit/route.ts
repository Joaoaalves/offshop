import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { requirePermission } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const deny = await requirePermission("admin:read");
  if (deny) return deny;

  await connectDB();

  const { searchParams } = req.nextUrl;
  const page  = Math.max(1, Number(searchParams.get("page")  ?? 1));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 50));
  const userId = searchParams.get("userId") ?? undefined;
  const action = searchParams.get("action") ?? undefined;

  const filter: Record<string, unknown> = {};
  if (userId) filter.userId = userId;
  if (action) filter.action = action;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
