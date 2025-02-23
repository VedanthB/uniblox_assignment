import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";

/**
 * Get Order History API
 *
 * @param {Request} req - Request object.
 * @param {object} params - URL parameters.
 * @param {string} params.userId - The ID of the user whose order history is to be retrieved.
 *
 * @returns {NextResponse} JSON response containing the user's orders.
 *
 * This endpoint retrieves all orders from the inMemoryStore that match the provided userId.
 * If no userId is provided, it returns an error. In case of an error during processing,
 * it returns a 500 status with an appropriate error message.
 */

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
