import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

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

    // Return the user's discount codes (both active & expired)
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
