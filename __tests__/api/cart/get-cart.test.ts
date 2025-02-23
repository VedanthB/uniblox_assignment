import { describe, it, expect, beforeEach, vi } from "vitest";
import { GET as getCart } from "../../../app/api/cart/[userId]/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

// Mock getServerSession to return a fake session with user id "test-user"
vi.mock("next-auth", () => ({
  getServerSession: async () => ({ user: { id: "test-user" } }),
}));

describe("GET /api/cart/[userId]", () => {
  beforeEach(() => {
    // Initialize cart and discount codes for test-user
    inMemoryStore.cart["test-user"] = [{ productId: "p1", name: "Test Product", price: 100, quantity: 2 }];
    inMemoryStore.userDiscountCodes["test-user"] = [{ code: "TESTCODE", expired: false }];
  });

  it("returns 200 with cart and discount codes for an authorized user", async () => {
    const req = new Request("http://localhost/api/cart/test-user");
    const res = await getCart(req, { params: { userId: "test-user" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.cart).toEqual(inMemoryStore.cart["test-user"]);
    expect(json.discountCodes).toEqual(inMemoryStore.userDiscountCodes["test-user"]);
  });

  it("returns 403 if session user does not match the requested userId", async () => {
    const req = new Request("http://localhost/api/cart/other-user");
    const res = await getCart(req, { params: { userId: "other-user" } });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Forbidden");
  });
});
