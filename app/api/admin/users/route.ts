import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, USER_ROLES } from "@/models/User";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function GET() {
  const deny = await requirePermission("admin:read");
  if (deny) return deny;

  await connectDB();
  const users = await User.find({}, { password: 0 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const deny = await requirePermission("admin:write");
  if (deny) return deny;

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (role && !USER_ROLES.includes(role)) {
    return NextResponse.json({ error: "Role inválida" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 },
    );
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role ?? "analista",
  });

  const { password: _, ...safe } = user.toObject();
  logAction(req, "admin:write", { id: String(user._id), email, role: role ?? "analyst" });
  return NextResponse.json(safe, { status: 201 });
}
