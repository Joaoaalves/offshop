import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/auth-guard";
import { auth } from "@/auth";
import { ApiToken } from "@/models/ApiToken";
import { generateToken, hashToken } from "@/lib/ingest-guard";

export async function GET() {
  const deny = await requirePermission("admin:read");
  if (deny) return deny;

  await connectDB();
  const tokens = await ApiToken.find({})
    .select("-tokenHash")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json(tokens);
}

export async function POST(req: NextRequest) {
  const deny = await requirePermission("admin:write");
  if (deny) return deny;

  const { name } = (await req.json()) as { name?: string };
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const session = await auth();
  const raw = generateToken();
  const prefix = raw.slice(0, 12);

  await connectDB();
  const token = await ApiToken.create({
    name: name.trim(),
    tokenHash: hashToken(raw),
    prefix,
    createdBy: session?.user?.name ?? "unknown",
  });

  // Return the raw token ONCE — it is never stored and cannot be recovered
  return NextResponse.json(
    { _id: token._id, name: token.name, prefix, token: raw },
    { status: 201 },
  );
}
