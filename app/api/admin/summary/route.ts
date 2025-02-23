import { inMemoryStore } from "@/lib/inMemoryDB";
import { NextResponse } from "next/server";

export async function GET() {
  // 1) Calculate totalItemsPurchased
  const totalItemsPurchased = inMemoryStore.orders.reduce((acc, order) => {
    const itemCount = order.items.reduce((count, item) => count + item.quantity, 0);
    return acc + itemCount;
  }, 0);

  // 2) Calculate totalPurchaseAmount
  const totalPurchaseAmount = inMemoryStore.orders.reduce((acc, order) => acc + order.totalAmount, 0);

  // 3) Calculate totalDiscountAmount
  const totalDiscountAmount = inMemoryStore.orders.reduce((acc, order) => {
    const itemSum = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // If discount was applied, difference is the discount
    if (order.discountApplied) {
      return acc + (itemSum - order.totalAmount);
    }
    return acc;
  }, 0);

  return NextResponse.json({
    totalOrders: inMemoryStore.orders.length,
    totalItemsPurchased,
    totalPurchaseAmount,
    totalDiscountAmount,
    orders: inMemoryStore.orders,
    userDiscounts: inMemoryStore.userDiscountCodes,
    adminDiscountCodes: inMemoryStore.adminDiscountCodes,
  });
}
