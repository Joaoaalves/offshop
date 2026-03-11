import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SelfProductRepository } from "@/repositories/self-product.repository";
import { selfProductSchema } from "@/lib/self-product-schema";
import { z } from "zod";

const bulkSchema = z.array(selfProductSchema);

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = bulkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  await connectDB();
  const repo = new SelfProductRepository();
  const result = await repo.bulkCreate(parsed.data);

  return NextResponse.json({ imported: result.length });
}
