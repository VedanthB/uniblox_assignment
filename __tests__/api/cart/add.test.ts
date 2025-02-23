import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as addToCart } from "../../../app/api/cart/add/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

// Use the same fake session as before
vi.mock("next-auth", () => ({
  getServerSession: async () => ({ user: { id: "test-user" } }),
}));

describe("POST /api/cart/add", () => {
  beforeEach(() => {
    inMemoryStore.cart["test-user"] = [];
  });

  it("adds a new item to the cart", async () => {
    const reqBody = {
      userId: "test-user",
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 1,
    };
    const req = new Request("http://localhost/api/cart/add", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await addToCart(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Item added to cart successfully");
    expect(json.cart.length).toBe(1);
    expect(json.cart[0].productId).toBe("p1");
  });

  it("increments quantity if the item already exists", async () => {
    inMemoryStore.cart["test-user"] = [{ productId: "p1", name: "Test Product", price: 100, quantity: 1 }];
    const reqBody = {
      userId: "test-user",
      productId: "p1",
      name: "Test Product",
      price: 100,
      quantity: 2,
    };
    const req = new Request("http://localhost/api/cart/add", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await addToCart(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cart.length).toBe(1);
    expect(json.cart[0].quantity).toBe(3);
  });

  it("returns 400 if required fields are missing", async () => {
    const reqBody = {
      userId: "test-user",
      productId: "p1",
      name: "Test Product",
      // Missing price and quantity
    };
    const req = new Request("http://localhost/api/cart/add", {
      method: "POST",
      body: JSON.stringify(reqBody),
    });
    const res = await addToCart(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing required fields");
  });
});
