import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ApiToken } from "@/models/ApiToken";

// ─── Token helpers ────────────────────────────────────────────────────────────

/** Generates a new raw token: "offs_<32 random hex bytes>" */
export function generateToken(): string {
  return `offs_${randomBytes(32).toString("hex")}`;
}

/** SHA-256 hash used for storage — the raw token is never persisted */
export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// ─── Guard ───────────────────────────────────────────────────────────────────

/**
 * Validates the `Authorization: Bearer <token>` header on ingest routes.
 *
 * Returns `null` if the token is valid (caller can proceed).
 * Returns a 401 `NextResponse` if the token is missing or invalid.
 *
 * @example
 * export async function POST(req: NextRequest) {
 *   const deny = await requireIngestToken(req);
 *   if (deny) return deny;
 *   ...
 * }
 */
export async function requireIngestToken(
  req: NextRequest,
): Promise<NextResponse | null> {
  const authHeader = req.headers.get("authorization") ?? "";
  const raw = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (!raw) {
    return NextResponse.json(
      { error: "Missing Authorization header" },
      { status: 401 },
    );
  }

  await connectDB();
  const hash = hashToken(raw);
  const token = await ApiToken.findOneAndUpdate(
    { tokenHash: hash },
    { $set: { lastUsedAt: new Date() } },
    { new: true },
  ).lean();

  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return null;
}
