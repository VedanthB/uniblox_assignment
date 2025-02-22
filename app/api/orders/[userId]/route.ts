import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userOrders = inMemoryStore.orders.filter((order) => order.userId === userId);

    return NextResponse.json({ orders: userOrders }, { status: 200 });
  } catch (error) {
    console.error("Error fetching order history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
