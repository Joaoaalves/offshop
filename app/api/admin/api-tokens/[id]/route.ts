import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth-guard";
import { ApiToken } from "@/models/ApiToken";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("admin:write");
  if (deny) return deny;

  await connectDB();
  const { id } = await params;
  const deleted = await ApiToken.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
