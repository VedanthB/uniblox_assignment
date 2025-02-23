import { describe, it, expect, beforeEach } from "vitest";
import { POST as signupPOST } from "../../../app/api/auth/signup/route";
import { inMemoryStore } from "../../../lib/inMemoryDB";

describe("User Sign-Up API", () => {
  beforeEach(() => {
    inMemoryStore.users = [];
  });

  it("returns an error if username or password is missing", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username: "testuser" }),
    });
    const res = await signupPOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Username and password are required");
  });

  it("creates a new user successfully", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "password123" }),
    });
    const res = await signupPOST(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toBe("User created successfully");
    expect(inMemoryStore.users.length).toBe(1);
  });

  it("returns an error if the user already exists", async () => {
    // Pre-create a user
    inMemoryStore.users.push({ id: "1", username: "testuser", password: "password123" });
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username: "testuser", password: "password123" }),
    });
    const res = await signupPOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("User already exists");
  });
});
