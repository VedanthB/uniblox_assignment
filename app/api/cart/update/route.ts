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
    const { userId, productId, quantity } = await req.json();
    if (!userId || !productId || quantity == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!inMemoryStore.cart[userId]) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }
    const itemIndex = inMemoryStore.cart[userId].findIndex((item) => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found in cart" }, { status: 404 });
    }
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      inMemoryStore.cart[userId].splice(itemIndex, 1);
    } else {
      inMemoryStore.cart[userId][itemIndex].quantity = quantity;
    }
    return NextResponse.json({ message: "Cart updated", cart: inMemoryStore.cart[userId] }, { status: 200 });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
