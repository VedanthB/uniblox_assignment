import { describe, it, expect, beforeEach } from "vitest";
import { POST as generateDiscountPOST } from "../../../app/api/admin/generate-discount/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

process.env.ADMIN_SECRET_KEY = "mysecureadminkey";

describe("Admin Generate Discount API", () => {
  beforeEach(() => {
    // Reset the in-memory store before each test
    inMemoryStore.adminDiscountCodes = [];
    inMemoryStore.userDiscountCodes = {};
    inMemoryStore.userOrderCount = {};
  });

  it("returns 403 for an invalid adminKey", async () => {
    const req = new Request("http://localhost/api/admin/generate-discount", {
      method: "POST",
      body: JSON.stringify({ adminKey: "wrongkey" }),
    });
    const res = await generateDiscountPOST(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("generates a global discount code when no userId is provided", async () => {
    const req = new Request("http://localhost/api/admin/generate-discount", {
      method: "POST",
      body: JSON.stringify({ adminKey: "mysecureadminkey" }),
    });
    const res = await generateDiscountPOST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBe("Global discount code generated");
    expect(json.discountCode).toMatch(/ADMIN-DISCOUNT-/);
    expect(inMemoryStore.adminDiscountCodes).toContain(json.discountCode);
  });

  it("returns an error if a user has fewer than 5 orders", async () => {
    const userId = "user123";
    inMemoryStore.userOrderCount[userId] = 3;
    const req = new Request("http://localhost/api/admin/generate-discount", {
      method: "POST",
      body: JSON.stringify({ adminKey: "mysecureadminkey", userId }),
    });
    const res = await generateDiscountPOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("User has fewer than 5 orders. Code not allowed.");
  });

  it("generates a user-specific discount code when user has 5 or more orders", async () => {
    const userId = "user123";
    inMemoryStore.userOrderCount[userId] = 5;
    // Pre-populate with an old discount code
    inMemoryStore.userDiscountCodes[userId] = [{ code: "OLD-CODE", expired: false }];
    const req = new Request("http://localhost/api/admin/generate-discount", {
      method: "POST",
      body: JSON.stringify({ adminKey: "mysecureadminkey", userId }),
    });
    const res = await generateDiscountPOST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toMatch(`New discount code generated for user ${userId}`);
    expect(json.discountCode).toMatch(new RegExp(`ADMIN-USER-${userId}-`));
    // Optionally, verify that the new code is active (not expired)
    const userCodes = inMemoryStore.userDiscountCodes[userId];
    expect(userCodes.some((dc) => dc.code === json.discountCode && !dc.expired)).toBe(true);
  });
});
