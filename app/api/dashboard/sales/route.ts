import { connectDB } from "@/lib/db";
import { MlSalesDashboard } from "@/models/mercado-livre/MlSalesDashboard";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const repo = new MlSalesDashboard();

  const res = await repo.getAll();

  return NextResponse.json(res);
}
