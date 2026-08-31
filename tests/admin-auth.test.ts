import { afterEach, describe, expect, it, vi } from "vitest";
import { ADMIN_TOKEN_HEADER, isAuthorizedAdmin } from "@/lib/auth/admin";

function requestWithToken(token: string | undefined) {
  const headers = new Headers();
  if (token !== undefined) headers.set(ADMIN_TOKEN_HEADER, token);
  return new Request("https://example.com/api/admin/x", { headers });
}

describe("isAuthorizedAdmin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("authorizes a request carrying the configured token", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(isAuthorizedAdmin(requestWithToken("correct-token"))).toBe(true);
  });

  it("rejects a request carrying the wrong token", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(isAuthorizedAdmin(requestWithToken("wrong-token"))).toBe(false);
  });

  it("rejects a request with no token header", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(isAuthorizedAdmin(requestWithToken(undefined))).toBe(false);
  });

  it("rejects a token that differs only in length", () => {
    vi.stubEnv("ADMIN_TOKEN", "correct-token");
    expect(isAuthorizedAdmin(requestWithToken("correct-token-with-suffix"))).toBe(false);
    expect(isAuthorizedAdmin(requestWithToken("correct-toke"))).toBe(false);
  });

  it("fails closed when ADMIN_TOKEN is unset, even with a matching-looking header", () => {
    vi.stubEnv("ADMIN_TOKEN", undefined);
    expect(isAuthorizedAdmin(requestWithToken(undefined))).toBe(false);
    expect(isAuthorizedAdmin(requestWithToken("anything"))).toBe(false);
  });
});
