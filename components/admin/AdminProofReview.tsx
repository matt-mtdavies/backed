"use client";

import { useState } from "react";
import Link from "next/link";
import { BackedLogo } from "@/components/brand/BackedLogo";
import { Arrow } from "@/components/icons/Arrow";

export function AdminProofReview() {
  const [note, setNote] = useState("Official result verified. Promise completed before deadline.");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ payableBacks: number; reviewedAt: string } | null>(null);
  const [error, setError] = useState("");

  async function approve() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/proofs/30000000-0000-4000-8000-000000000001/approve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ note }) });
    const body = await response.json() as { payableBacks?: number; reviewedAt?: string; error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(body.error ?? "Proof could not be approved.");
      return;
    }
    setResult({ payableBacks: body.payableBacks ?? 0, reviewedAt: body.reviewedAt ?? new Date().toISOString() });
  }

  return <main className="adminProofPage">
    <header><BackedLogo/><span>INTERNAL ALPHA</span></header>
    <section className="adminProofShell">
      <div className="adminProofIntro">
        <p className="eyebrow">PROOF REVIEW</p>
        <h1>VERIFY<br/>THE PROMISE<span>.</span></h1>
        <p>Approval completes the Promise and marks active Backs payable. Release still requires the payment path.</p>
      </div>
      <article className="adminProofCard">
        <span>PENDING PROOF</span>
        <h2>Jason finished his first half marathon.</h2>
        <dl>
          <div><dt>Promise</dt><dd>Run my first half marathon</dd></div>
          <div><dt>Evidence</dt><dd>https://results.example.com/jason-half</dd></div>
          <div><dt>Backs</dt><dd>1 active Back will become payable</dd></div>
        </dl>
        <label>REVIEW NOTE<textarea value={note} onChange={event=>setNote(event.target.value)} maxLength={500}/></label>
        {error && <p className="formError" role="alert">{error}</p>}
        {result && <p className="adminResult" role="status">Proof approved. {result.payableBacks} Back {result.payableBacks === 1 ? "is" : "are"} now payable.</p>}
        <div className="adminProofActions"><Link href={result ? "/admin/releases" : "/p/jason-first-half"}>{result ? "RELEASE BACKING" : "VIEW PROMISE"} <Arrow/></Link><button className="button primary" disabled={busy || Boolean(result)} onClick={approve}>{busy ? "APPROVING..." : result ? "APPROVED" : "APPROVE PROOF"}<Arrow/></button></div>
      </article>
    </section>
  </main>;
}
