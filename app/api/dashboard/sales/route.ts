import { connectDB } from "@/lib/db";
import { MlSalesDashboardRepository } from "@/repositories/mercado-livre/sales-dashboard/sales-dashboard.repository";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const repo = new MlSalesDashboardRepository();

  const res = await repo.getAll();
  return NextResponse.json(res);
}
