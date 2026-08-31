"use client";

import { useState } from "react";
import Link from "next/link";
import { BackedLogo } from "@/components/brand/BackedLogo";
import { Arrow } from "@/components/icons/Arrow";
import { AdminTokenGate, useAdminToken } from "@/components/admin/AdminTokenGate";

export function AdminReleaseBacking() {
  const { token, save, clear } = useAdminToken();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ providerReference: string; releasedAt: string } | null>(null);
  const [error, setError] = useState("");
  const [gateMessage, setGateMessage] = useState("");

  async function release() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/backs/20000000-0000-4000-8000-000000000001/release", { method: "POST", headers: { "x-admin-token": token ?? "" } });
    const body = await response.json() as { providerReference?: string; releasedAt?: string; error?: string };
    setBusy(false);
    if (!response.ok) {
      if (response.status === 401) {
        setGateMessage("That token didn’t work. Try again.");
        clear();
        return;
      }
      setError(body.error ?? "Backing could not be released.");
      return;
    }
    setResult({ providerReference: body.providerReference ?? "alpha", releasedAt: body.releasedAt ?? new Date().toISOString() });
  }

  if (token === undefined) return null;
  if (!token) return <AdminTokenGate onSubmit={save} message={gateMessage}/>;

  return <main className="adminReleasePage">
    <header><BackedLogo/><span>INTERNAL ALPHA</span></header>
    <section className="adminReleaseShell">
      <div className="adminReleaseIntro">
        <p className="eyebrow">RELEASE BACKING</p>
        <h1>KEEP<br/>THE PROMISE<span>.</span></h1>
        <p>Release starts after Proof approval. Alpha records the event through the payment abstraction without moving real money.</p>
      </div>
      <article className="adminReleaseCard">
        <span>PAYABLE BACK</span>
        <h2>$250 behind Jason.</h2>
        <dl>
          <div><dt>Backer</dt><dd>Matthew</dd></div>
          <div><dt>Promise</dt><dd>Run my first half marathon</dd></div>
          <div><dt>Provider</dt><dd>AlphaMockPaymentProvider</dd></div>
        </dl>
        <p className="releaseWarning">Confirm only after the payment provider is ready to record release. In Alpha, this records a mocked release event.</p>
        {error && <p className="formError" role="alert">{error}</p>}
        {result && <p className="adminResult" role="status">Backing released in Alpha. Reference: {result.providerReference}</p>}
        <div className="adminProofActions"><Link href="/admin/proofs">BACK TO PROOF <Arrow direction="w"/></Link><button className="button primary" disabled={busy || Boolean(result)} onClick={release}>{busy ? "RELEASING..." : result ? "RELEASED" : "RELEASE BACKING"}<Arrow/></button></div>
      </article>
    </section>
  </main>;
}
