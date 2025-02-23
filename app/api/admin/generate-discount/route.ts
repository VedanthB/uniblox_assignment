import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryDB";

/**
 * Admin Generate Discount Code API
 *
 * @param {object} req - Request object containing JSON payload.
 * @param {string} req.adminKey - Admin secret key for authorization.
 * @param {string} [req.userId] - (Optional) User ID for a user-specific discount code.
 *
 * @returns {NextResponse} JSON response with a discount code if successful,
 * or an error message otherwise.
 *
 * - If no userId is provided, generates a global discount code.
 * - If a userId is provided, verifies that the user has ≥ 5 orders before generating a user-specific code.
 */

export async function POST(req: Request) {
  try {
    const { adminKey, userId } = await req.json();

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If no userId, generate a global code
    if (!userId) {
      const discountCode = `ADMIN-DISCOUNT-${Date.now()}`;
      inMemoryStore.adminDiscountCodes.push(discountCode);

      return NextResponse.json({ message: "Global discount code generated", discountCode }, { status: 201 });
    }

    // Otherwise, generate a code for a specific user (if user has >= 5 orders)
    const userOrderCount = inMemoryStore.userOrderCount[userId] || 0;
    if (userOrderCount < 5) {
      return NextResponse.json({ error: "User has fewer than 5 orders. Code not allowed." }, { status: 400 });
    }

    // Expire any old codes
    const userCodes = inMemoryStore.userDiscountCodes[userId] || [];
    userCodes.forEach((dc) => {
      dc.expired = true;
    });

    // Create a new user-specific code
    const discountCode = `ADMIN-USER-${userId}-${Date.now()}`;
    userCodes.push({ code: discountCode, expired: false });
    inMemoryStore.userDiscountCodes[userId] = userCodes;

    return NextResponse.json(
      {
        message: `New discount code generated for user ${userId}`,
        discountCode,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error generating discount code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
