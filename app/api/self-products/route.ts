import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { requirePermission } from "@/lib/auth-guard";
import { logAction } from "@/lib/audit";

export async function GET() {
  const deny = await requirePermission("products:read");
  if (deny) return deny;
  await connectDB();
  const repo = new SelfProductRepository();
  return NextResponse.json(await repo.findAll());
}

export async function POST(req: NextRequest) {
  const deny = await requirePermission("products:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const repo = new SelfProductRepository();
  const product = await repo.create(data);
  logAction(req, "products:write", { id: String(product._id), baseSku: data.baseSku });
  return NextResponse.json(product);
}
