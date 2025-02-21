import { NextResponse } from "next/server";
import { inMemoryStore } from "@/lib/inMemoryStore";

export async function POST(req: Request) {
  try {
    const { adminKey } = await req.json();

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate a unique discount code
    const discountCode = `ADMIN-DISCOUNT-${Date.now()}`;
    inMemoryStore.adminDiscountCodes.push(discountCode);

    return NextResponse.json({ message: "Discount code generated", discountCode }, { status: 201 });
  } catch (error) {
    console.error("Error generating discount code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
