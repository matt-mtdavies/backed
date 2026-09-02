"use client";

import { useEffect, useRef, useState } from "react";
import { BackedMark } from "@/components/brand/BackedMark";

export function LoginFlow() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { (step === "email" ? emailRef : codeRef).current?.focus(); }, [step]);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) { setError("Enter a valid email."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/request-code", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "We couldn't send a code. Try again.");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't send a code. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) { setError("Enter the code from your email."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/verify-code", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, code: code.trim() }) });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "That code didn't work.");
      window.location.href = "/me";
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="loginGate">
      {step === "email" ? (
        <form className="card" onSubmit={requestCode}>
          <div className="brandMark"><BackedMark /></div>
          <h1>SIGN IN<span>.</span></h1>
          <p className="stepIntro">We’ll email you a code — no password to remember.</p>
          {error && <p className="formError" role="alert">{error}</p>}
          <label>
            EMAIL
            <input ref={emailRef} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="button primary" type="submit" disabled={busy}>{busy ? "SENDING…" : "SEND CODE"}</button>
        </form>
      ) : (
        <form className="card" onSubmit={verifyCode}>
          <div className="brandMark"><BackedMark /></div>
          <h1>CHECK YOUR<br />EMAIL<span>.</span></h1>
          <p className="stepIntro">Enter the code we sent to {email}.</p>
          {error && <p className="formError" role="alert">{error}</p>}
          <label>
            CODE
            <input ref={codeRef} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} />
          </label>
          <button className="button primary" type="submit" disabled={busy}>{busy ? "VERIFYING…" : "CONTINUE"}</button>
          <button type="button" className="changeEmail" onClick={() => { setStep("email"); setCode(""); setError(""); }}>USE A DIFFERENT EMAIL</button>
        </form>
      )}
    </main>
  );
}
