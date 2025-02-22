import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, productId, name, price, quantity } = await req.json();

    if (!userId || !productId || !name || !price || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!inMemoryStore.cart[userId]) {
      inMemoryStore.cart[userId] = [];
    }

    // Check if item already exists in cart
    const existingItem = inMemoryStore.cart[userId].find((item) => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      inMemoryStore.cart[userId].push({ productId, name, price, quantity });
    }

    return NextResponse.json(
      { message: "Item added to cart successfully", cart: inMemoryStore.cart[userId] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in Add to Cart API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
