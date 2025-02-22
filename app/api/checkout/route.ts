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
      const userCodes = inMemoryStore.userDiscountCodes[userId] || [];
      // Find a code object that matches and is not expired
      const codeObjIndex = userCodes.findIndex((dc) => dc.code === discountCode && dc.expired === false);

      if (codeObjIndex === -1) {
        return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
      }

      // Code is valid – apply discount
      discountApplied = true;
      totalAmount = totalAmount * 0.9; // 10% off

      // Mark code as used by removing it (or you could set dc.expired = true)
      userCodes.splice(codeObjIndex, 1);
      inMemoryStore.userDiscountCodes[userId] = userCodes;
    }

    if (!inMemoryStore.userOrderCount[userId]) {
      inMemoryStore.userOrderCount[userId] = 0;
    }
    inMemoryStore.userOrderCount[userId]++;

    // Generate a new code automatically for every 5th order
    const newCount = inMemoryStore.userOrderCount[userId];
    let newlyGeneratedCode: string | undefined;

    if (newCount % 5 === 0) {
      const userCodes = inMemoryStore.userDiscountCodes[userId] || [];
      // Expire old codes
      userCodes.forEach((dc) => {
        dc.expired = true;
      });
      // Generate a brand-new code
      newlyGeneratedCode = `DISCOUNT-${Date.now()}`;
      userCodes.push({ code: newlyGeneratedCode, expired: false });
      inMemoryStore.userDiscountCodes[userId] = userCodes;
    }

    // Create the order
    const newOrder = {
      orderId: `ORDER-${Date.now()}`,
      userId,
      items: cartItems,
      totalAmount,
      discountApplied,
      discountCode: discountApplied ? discountCode : undefined,
      newDiscountCode: newlyGeneratedCode,
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
