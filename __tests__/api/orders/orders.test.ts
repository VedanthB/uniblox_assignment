import { describe, it, expect, beforeEach } from "vitest";
import { GET as getOrders } from "../../../app/api/orders/[userId]/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

describe("GET /api/orders/[userId]", () => {
  beforeEach(() => {
    inMemoryStore.orders = [
      { orderId: "order1", userId: "test-user", items: [], totalAmount: 100 },
      { orderId: "order2", userId: "other-user", items: [], totalAmount: 50 },
    ];
  });

  it("returns orders for the specified user", async () => {
    const req = new Request("http://localhost/api/orders/test-user");
    const res = await getOrders(req, { params: { userId: "test-user" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.orders.length).toBe(1);
    expect(json.orders[0].orderId).toBe("order1");
  });

  it("returns an error if userId is missing", async () => {
    const req = new Request("http://localhost/api/orders/");
    const res = await getOrders(req, { params: { userId: "" } });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("User ID is required");
  });
});
