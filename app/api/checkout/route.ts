import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function POST(req: Request) {
  try {
    const { userId, discountCode } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const cartItems = inMemoryStore.cart[userId];
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate order total
    let totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountApplied = false;

    // If a discount code was provided, verify & apply
    if (discountCode) {
      // Look up the user's available codes
      const userCodes = inMemoryStore.userDiscountCodes[userId] || [];

      // Check if the provided code is in the user's list of valid (unused) codes
      const codeIndex = userCodes.indexOf(discountCode);
      if (codeIndex === -1) {
        return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
      }

      // Code is valid – apply discount
      discountApplied = true;
      totalAmount = totalAmount * 0.9; // 10% off

      // Mark the code as “used” by removing it from user's list
      userCodes.splice(codeIndex, 1);
      inMemoryStore.userDiscountCodes[userId] = userCodes;
    }

    if (!inMemoryStore.userOrderCount[userId]) {
      inMemoryStore.userOrderCount[userId] = 0;
    }
    inMemoryStore.userOrderCount[userId]++;

    // Create the order
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
