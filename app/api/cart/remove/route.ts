import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

/**
 * Remove from Cart API
 *
 * @param {Request} req - Request object with JSON payload containing:
 *   - userId: string (required)
 *   - productId: string (required)
 *
 * @returns {NextResponse} JSON response with a success message and the updated cart,
 * or an error message if the user is unauthorized, required fields are missing, or the cart is not found.
 *
 * Behavior:
 *  - Validates that the session user matches the provided userId.
 *  - Filters out the cart item with the specified productId.
 */

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, productId } = await req.json();

    // Ensure the user in the session matches the userId in the request
    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!userId || !productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!inMemoryStore.cart[userId]) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    inMemoryStore.cart[userId] = inMemoryStore.cart[userId].filter((item) => item.productId !== productId);

    return NextResponse.json(
      { message: "Item removed successfully", cart: inMemoryStore.cart[userId] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
