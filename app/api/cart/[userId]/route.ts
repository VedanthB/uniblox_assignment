import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!inMemoryStore.cart[userId]) {
      inMemoryStore.cart[userId] = []; // Ensure cart exists for user
    }

    return NextResponse.json({ cart: inMemoryStore.cart[userId] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
