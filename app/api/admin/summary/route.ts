import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function GET() {
  return NextResponse.json({
    totalOrders: inMemoryStore.orders.length,
    orders: inMemoryStore.orders,
    userDiscounts: inMemoryStore.userDiscountCodes, // ✅ Now showing user-specific discounts
    adminDiscountCodes: inMemoryStore.adminDiscountCodes,
  });
}
