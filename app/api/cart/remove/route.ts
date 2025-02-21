import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function POST(req: Request) {
  try {
    const { userId, productId } = await req.json();

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
