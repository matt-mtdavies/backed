"use client";

import { useEffect, useState } from "react";
import { BackedMark } from "@/components/brand/BackedMark";

// The link Supabase emails is the fallback path for accounts stuck on the
// default (non-custom-SMTP) email templates, which can't be edited to show
// the OTP code — see ADR-0016. Clicking it lands here with the session in
// the URL fragment (`#access_token=...`), which never reaches the server,
// so this has to read it client-side and hand it to our own API.
export function AuthCallback() {
  const [status, setStatus] = useState<"working" | "error">("working");
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    async function signIn() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const errorDescription = hash.get("error_description");

      if (errorDescription) throw new Error(errorDescription.replace(/\+/g, " "));
      if (!accessToken) throw new Error("That link didn't work. Request a new one.");

      const response = await fetch("/api/auth/session-from-token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accessToken }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? "That link didn't work. Request a new one.");
      }
      window.location.href = "/me";
    }

    signIn().catch((err: unknown) => {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "That link didn't work. Request a new one.");
    });
  }, []);

  return (
    <main className="loginGate">
      <div className="card">
        <div className="brandMark"><BackedMark /></div>
        <h1>{status === "working" ? "SIGNING IN" : "SIGN IN FAILED"}<span>.</span></h1>
        {status === "error" ? (
          <>
            <p className="formError" role="alert">{message}</p>
            <a className="button primary" href="/login">TRY AGAIN</a>
          </>
        ) : (
          <p className="stepIntro">{message}</p>
        )}
      </div>
    </main>
  );
}
