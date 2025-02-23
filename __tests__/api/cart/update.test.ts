import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as updateCart } from "../../../app/api/cart/update/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

vi.mock("next-auth", () => ({
  getServerSession: async () => ({ user: { id: "test-user" } }),
}));

describe("POST /api/cart/update", () => {
  beforeEach(() => {
    inMemoryStore.cart["test-user"] = [{ productId: "p1", name: "Test Product", price: 100, quantity: 2 }];
  });

  it("updates the quantity of an existing item", async () => {
    const reqBody = { userId: "test-user", productId: "p1", quantity: 5 };
    const req = new Request("http://localhost/api/cart/update", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await updateCart(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Cart updated");
    expect(json.cart[0].quantity).toBe(5);
  });

  it("removes the item if quantity is 0 or less", async () => {
    const reqBody = { userId: "test-user", productId: "p1", quantity: 0 };
    const req = new Request("http://localhost/api/cart/update", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await updateCart(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cart.length).toBe(0);
  });

  it("returns 404 if the item is not found in the cart", async () => {
    const reqBody = { userId: "test-user", productId: "p2", quantity: 3 };
    const req = new Request("http://localhost/api/cart/update", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await updateCart(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Item not found in cart");
  });
});
