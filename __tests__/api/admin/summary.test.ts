import { describe, it, expect, beforeEach } from "vitest";
import { GET as adminSummaryGET } from "../../../app/api/admin/summary/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

describe("Admin Summary API", () => {
  beforeEach(() => {
    inMemoryStore.orders = [];
    inMemoryStore.userDiscountCodes = {};
    inMemoryStore.adminDiscountCodes = [];
  });

  it("returns summary values of zero when no orders exist", async () => {
    const res = await adminSummaryGET();
    const json = await res.json();
    expect(json.totalOrders).toBe(0);
    expect(json.totalItemsPurchased).toBe(0);
    expect(json.totalPurchaseAmount).toBe(0);
    expect(json.totalDiscountAmount).toBe(0);
    expect(json.orders).toEqual([]);
  });

  it("calculates summary correctly for orders with discounts applied", async () => {
    // Create two sample orders (one with discount applied)
    inMemoryStore.orders = [
      {
        orderId: "order1",
        userId: "user1",
        items: [{ productId: "p1", name: "Product 1", price: 100, quantity: 2 }],
        totalAmount: 180, // discount applied (original sum 200, discount 20)
        discountApplied: true,
      },
      {
        orderId: "order2",
        userId: "user2",
        items: [{ productId: "p2", name: "Product 2", price: 50, quantity: 1 }],
        totalAmount: 50,
        discountApplied: false,
      },
    ];
    const res = await adminSummaryGET();
    const json = await res.json();
    expect(json.totalOrders).toBe(2);
    expect(json.totalItemsPurchased).toBe(3);
    expect(json.totalPurchaseAmount).toBe(230);
    expect(json.totalDiscountAmount).toBe(20);
  });
});
