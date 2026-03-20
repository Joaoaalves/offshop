import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { requirePermission } from "@/lib/auth-guard";

export async function GET() {
  const deny = await requirePermission("products:read");
  if (deny) return deny;
  await connectDB();
  const repo = new SelfProductRepository();
  return NextResponse.json(await repo.findAll());
}

export async function POST(req: Request) {
  const deny = await requirePermission("products:write");
  if (deny) return deny;
  await connectDB();
  const data = await req.json();
  const repo = new SelfProductRepository();
  const product = await repo.create(data);
  return NextResponse.json(product);
}
