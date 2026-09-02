import { describe, expect, it } from "vitest";
import { buildSessionCookie, buildClearSessionCookie, readSessionToken } from "@/lib/auth/session";

describe("session cookie", () => {
  it("builds an httpOnly, secure cookie carrying the access token", () => {
    const cookie = buildSessionCookie("abc.def.ghi");
    expect(cookie).toContain("backed_session=abc.def.ghi");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
  });

  it("clears the cookie with Max-Age=0", () => {
    expect(buildClearSessionCookie()).toContain("Max-Age=0");
  });

  it("reads the token back out of a real Request's cookie header", () => {
    const request = new Request("https://example.com", { headers: { cookie: "other=1; backed_session=abc.def.ghi; another=2" } });
    expect(readSessionToken(request)).toBe("abc.def.ghi");
  });

  it("returns null when there is no session cookie", () => {
    const request = new Request("https://example.com", { headers: { cookie: "other=1" } });
    expect(readSessionToken(request)).toBeNull();
  });

  it("returns null when there is no cookie header at all", () => {
    const request = new Request("https://example.com");
    expect(readSessionToken(request)).toBeNull();
  });
});
