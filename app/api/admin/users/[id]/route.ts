import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("admin:write");
  if (deny) return deny;

  const { id } = await params;
  const body = await req.json();

  await connectDB();

  const update: Record<string, unknown> = {};
  if (body.name) update.name = body.name;
  if (body.role) update.role = body.role;
  if (body.password) update.password = await bcrypt.hash(body.password, 12);

  const user = await User.findByIdAndUpdate(id, update, {
    new: true,
    select: "-password",
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  logAction(req, "admin:write", { id, fields: Object.keys(update) });
  return NextResponse.json(user);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = await requirePermission("admin:write");
  if (deny) return deny;

  const { id } = await params;
  const session = await auth();

  if (session?.user.id === id) {
    return NextResponse.json(
      { error: "Não é possível excluir sua própria conta" },
      { status: 400 },
    );
  }

  await connectDB();
  await User.findByIdAndDelete(id);
  logAction(req, "admin:delete", { id });
  return NextResponse.json({ ok: true });
}
