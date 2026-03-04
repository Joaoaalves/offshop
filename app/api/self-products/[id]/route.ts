import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params; // agora faz sentido usar await
  const data = await req.json();

  const repo = new SelfProductRepository();
  const updated = await repo.update(id, data);

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectDB();

  const { id } = await params;
  const repo = new SelfProductRepository();
  await repo.delete(id);

  return NextResponse.json({ success: true });
}
