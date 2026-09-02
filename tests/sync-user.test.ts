import { describe, expect, it, vi } from "vitest";
import { syncUserForAuthId, buildProfileSlug } from "@/lib/auth/sync-user";

describe("syncUserForAuthId", () => {
  it("returns the existing user when the auth identity is already linked", async () => {
    const users = {
      findByAuthUserId: vi.fn(async () => ({ id: "user-1" })),
      findByEmail: vi.fn(async () => null),
      insert: vi.fn(async () => {}),
      linkAuthUserId: vi.fn(async () => {}),
      ensureProfile: vi.fn(async () => {}),
    };
    const result = await syncUserForAuthId({ authUserId: "auth-1", email: "jason@example.com" }, { users, id: () => "new-id" });
    expect(result).toEqual({ userId: "user-1" });
    expect(users.insert).not.toHaveBeenCalled();
  });

  it("links an existing unauthenticated user (seed data) by email rather than duplicating it", async () => {
    const users = {
      findByAuthUserId: vi.fn(async () => null),
      findByEmail: vi.fn(async () => ({ id: "user-2", authUserId: null })),
      insert: vi.fn(async () => {}),
      linkAuthUserId: vi.fn(async () => {}),
      ensureProfile: vi.fn(async () => {}),
    };
    const result = await syncUserForAuthId({ authUserId: "auth-2", email: "matthew@example.com" }, { users, id: () => "new-id" });
    expect(result).toEqual({ userId: "user-2" });
    expect(users.linkAuthUserId).toHaveBeenCalledWith("user-2", "auth-2");
    expect(users.insert).not.toHaveBeenCalled();
  });

  it("does not re-link a users row that already has a different auth identity", async () => {
    const users = {
      findByAuthUserId: vi.fn(async () => null),
      findByEmail: vi.fn(async () => ({ id: "user-3", authUserId: "auth-other" })),
      insert: vi.fn(async () => {}),
      linkAuthUserId: vi.fn(async () => {}),
      ensureProfile: vi.fn(async () => {}),
    };
    await syncUserForAuthId({ authUserId: "auth-3", email: "priya@example.com" }, { users, id: () => "new-id" });
    expect(users.linkAuthUserId).not.toHaveBeenCalled();
  });

  it("creates a new user and profile when neither the identity nor the email exist yet", async () => {
    const users = {
      findByAuthUserId: vi.fn(async () => null),
      findByEmail: vi.fn(async () => null),
      insert: vi.fn(async () => {}),
      linkAuthUserId: vi.fn(async () => {}),
      ensureProfile: vi.fn(async () => {}),
    };
    const result = await syncUserForAuthId({ authUserId: "auth-4", email: "sam.taylor@example.com" }, { users, id: () => "new-id" });
    expect(result).toEqual({ userId: "new-id" });
    expect(users.insert).toHaveBeenCalledWith({ id: "new-id", authUserId: "auth-4", email: "sam.taylor@example.com" });
    expect(users.ensureProfile).toHaveBeenCalledWith({ userId: "new-id", displayName: "sam.taylor", slug: "sam-taylor-newid" });
  });
});

describe("buildProfileSlug", () => {
  it("derives a url-safe slug from the email's local part", () => {
    expect(buildProfileSlug("Sam.Taylor+alpha@example.com", "10000000-aaaa-bbbb")).toBe("sam-taylor-alpha-10000000");
  });

  it("falls back to a generic base when the local part has no safe characters", () => {
    expect(buildProfileSlug("+++@example.com", "abcdefgh1234")).toBe("member-abcdefgh");
  });
});
