import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { inMemoryStore } from "@/lib/inMemoryDB";

/**
 * Checkout API
 *
 * @param {Request} req - Request object with an optional discountCode in its JSON payload.
 *
 * @returns {NextResponse} JSON response containing:
 *   - message: Success message.
 *   - order: The newly created order object.
 *
 * Behavior:
 *   - Validates the user session.
 *   - Retrieves the user's cart and calculates the total amount.
 *   - Applies a 10% discount if a valid discountCode is provided.
 *   - Increments the user's order count.
 *   - Generates a new discount code every 5th order.
 *   - Saves the order and clears the user's cart.
 */

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const cartItems = inMemoryStore.cart[userId];
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discountApplied = false;

    // Check for discount code
    const { discountCode } = await req.json();
    if (discountCode) {
      const userCodes = inMemoryStore.userDiscountCodes[userId] || [];
      const codeIndex = userCodes.findIndex((dc) => dc.code === discountCode && !dc.expired);

      if (codeIndex === -1) {
        return NextResponse.json({ error: "Invalid or expired discount code" }, { status: 400 });
      }

      // Apply discount and expire the code
      discountApplied = true;
      totalAmount = totalAmount * 0.9;
      userCodes[codeIndex].expired = true;
    }

    // Increment user’s order count
    if (!inMemoryStore.userOrderCount[userId]) {
      inMemoryStore.userOrderCount[userId] = 0;
    }
    inMemoryStore.userOrderCount[userId]++;

    // Generate a discount code every 5th order
    const newCount = inMemoryStore.userOrderCount[userId];
    let newlyGeneratedCode: string | undefined;
    if (newCount % 5 === 0) {
      const userCodes = inMemoryStore.userDiscountCodes[userId] || [];
      userCodes.forEach((dc) => (dc.expired = true)); // Expire previous codes
      newlyGeneratedCode = `DISCOUNT-${Date.now()}`;
      userCodes.push({ code: newlyGeneratedCode, expired: false });
      inMemoryStore.userDiscountCodes[userId] = userCodes;
    }

    const newOrder = {
      orderId: `ORDER-${Date.now()}`,
      userId,
      items: cartItems,
      totalAmount,
      discountApplied,
      discountCode: discountApplied ? discountCode : undefined,
      newDiscountCode: newlyGeneratedCode,
    };

    inMemoryStore.orders.push(newOrder);
    delete inMemoryStore.cart[userId];

    return NextResponse.json({ message: "Order placed successfully", order: newOrder }, { status: 200 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
