import { inMemoryStore } from "@/lib/inMemoryDB";
import { NextResponse } from "next/server";

/**
 * User Sign-Up API
 *
 * @param {object} req - Request object containing JSON payload with:
 *   - username: string (required)
 *   - password: string (required)
 *
 * @returns {NextResponse} JSON response with a success message if the user is created,
 * or an error message if the user already exists or if required fields are missing.
 */

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = inMemoryStore.users.find((user) => user.username === username);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Create a new user
    const newUser = { id: Date.now().toString(), username, password };
    inMemoryStore.users.push(newUser);

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error in sign-up API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
