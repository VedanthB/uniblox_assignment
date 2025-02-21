import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!inMemoryStore.cart[userId] || inMemoryStore.cart[userId].length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const cartItems = inMemoryStore.cart[userId];
    let totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountApplied = false;
    let discountCode = "";

    // Track user order count
    if (!inMemoryStore.userOrderCount[userId]) {
      inMemoryStore.userOrderCount[userId] = 0;
    }
    inMemoryStore.userOrderCount[userId]++;

    // Apply discount for every 5th order **for this user**
    if (inMemoryStore.userOrderCount[userId] % 5 === 0) {
      discountApplied = true;
      discountCode = `DISCOUNT-${Date.now()}`;
      totalAmount *= 0.9; // Apply 10% discount

      // Store user-specific discount
      if (!inMemoryStore.userDiscountCodes[userId]) {
        inMemoryStore.userDiscountCodes[userId] = [];
      }
      inMemoryStore.userDiscountCodes[userId].push(discountCode);
    }

    const newOrder = {
      orderId: `ORDER-${Date.now()}`,
      userId,
      items: cartItems,
      totalAmount,
      discountApplied,
      discountCode: discountApplied ? discountCode : undefined,
    };

    // Save order & clear cart
    inMemoryStore.orders.push(newOrder);
    delete inMemoryStore.cart[userId];

    return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 200 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
