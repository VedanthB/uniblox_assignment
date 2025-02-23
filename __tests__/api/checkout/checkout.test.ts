import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as checkout } from "../../../app/api/checkout/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

vi.mock("next-auth", () => ({
  getServerSession: async () => ({ user: { id: "test-user" } }),
}));

describe("POST /api/checkout", () => {
  beforeEach(() => {
    inMemoryStore.cart["test-user"] = [{ productId: "p1", name: "Test Product", price: 100, quantity: 2 }];
    inMemoryStore.userDiscountCodes["test-user"] = [{ code: "VALIDCODE", expired: false }];
    inMemoryStore.userOrderCount["test-user"] = 4;
    inMemoryStore.orders = [];
  });

  it("processes checkout without a discount code", async () => {
    const req = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await checkout(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Order placed successfully");
    expect(inMemoryStore.orders.length).toBe(1);
    expect(inMemoryStore.cart["test-user"]).toBeUndefined();
    expect(inMemoryStore.userOrderCount["test-user"]).toBe(5);
    // If order count is a multiple of 5, a new discount code should be generated
    if (inMemoryStore.userOrderCount["test-user"] % 5 === 0) {
      expect(json.order.newDiscountCode).toBeDefined();
    }
  });

  it("applies a valid discount code correctly", async () => {
    inMemoryStore.userOrderCount["test-user"] = 1; // avoid triggering new discount generation
    const req = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ discountCode: "VALIDCODE" }),
    });
    const res = await checkout(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.order.discountApplied).toBe(true);
    expect(json.order.discountCode).toBe("VALIDCODE");
    // Verify that the discount code is now marked as expired
    const userCodes = inMemoryStore.userDiscountCodes["test-user"];
    const code = userCodes.find((dc) => dc.code === "VALIDCODE");
    expect(code?.expired).toBe(true);
  });

  it("returns an error for an invalid discount code", async () => {
    const req = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({ discountCode: "INVALIDCODE" }),
    });
    const res = await checkout(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid or expired discount code");
  });

  it("returns an error if the cart is empty", async () => {
    delete inMemoryStore.cart["test-user"];
    const req = new Request("http://localhost/api/checkout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const res = await checkout(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Cart is empty");
  });
});
