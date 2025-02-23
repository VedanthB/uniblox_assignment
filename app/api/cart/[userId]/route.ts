import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

/**
 * Get Cart API
 *
 * @param req - The incoming Request object.
 * @param params - An object containing the userId parameter from the URL.
 *
 * @returns {NextResponse} JSON response containing:
 *  - cart: An array of cart items for the specified user.
 *  - discountCodes: An array of discount codes (both active and expired) for the user.
 *
 * Behavior:
 *  - Verifies the user's session; only the logged-in user can access their own cart.
 *  - Initializes the cart if it does not exist.
 */

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = params.userId;

    // Ensure the user in the session matches the userId in the URL
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If the cart doesn't exist yet, initialize it
    if (!inMemoryStore.cart[userId]) {
      inMemoryStore.cart[userId] = [];
    }

    const discountCodes = inMemoryStore.userDiscountCodes[userId] || [];

    return NextResponse.json(
      {
        cart: inMemoryStore.cart[userId],
        discountCodes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
