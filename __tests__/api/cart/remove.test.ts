import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST as removeFromCart } from "../../../app/api/cart/remove/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";
import * as nextAuth from "next-auth";

// Mock next-auth at the top level so all imports get the same instance.
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

describe("POST /api/cart/remove", () => {
  beforeEach(() => {
    // Set up cart for "test-user"
    inMemoryStore.cart["test-user"] = [
      { productId: "p1", name: "Test Product", price: 100, quantity: 1 },
      { productId: "p2", name: "Another Product", price: 50, quantity: 2 },
    ];
    // Default session: user id "test-user"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nextAuth.getServerSession as any).mockResolvedValue({ user: { id: "test-user" } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("removes the specified item from the cart", async () => {
    const reqBody = { userId: "test-user", productId: "p1" };
    const req = new Request("http://localhost/api/cart/remove", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await removeFromCart(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cart.length).toBe(1);
    expect(json.cart[0].productId).toBe("p2");
  });

  it("returns 404 if cart is not found", async () => {
    delete inMemoryStore.cart["test-user"];
    const reqBody = { userId: "test-user", productId: "p1" };
    const req = new Request("http://localhost/api/cart/remove", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await removeFromCart(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Cart not found");
  });

  it("returns 403 if session user does not match", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (nextAuth.getServerSession as any).mockResolvedValueOnce({ user: { id: "other-user" } });
    const reqBody = { userId: "test-user", productId: "p1" };
    const req = new Request("http://localhost/api/cart/remove", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await removeFromCart(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Forbidden");
  });
});
