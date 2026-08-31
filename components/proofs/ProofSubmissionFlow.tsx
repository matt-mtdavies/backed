"use client";

import { useState } from "react";
import Link from "next/link";
import { BackedLogo } from "@/components/brand/BackedLogo";
import { BackedMark } from "@/components/brand/BackedMark";
import { Arrow } from "@/components/icons/Arrow";

export function ProofSubmissionFlow({ slug, name, promiseTitle }: { slug: string; name: string; promiseTitle: string }) {
  const [proofUrl, setProofUrl] = useState("https://results.example.com/jason-half");
  const [resultUrl, setResultUrl] = useState("");
  const [note, setNote] = useState("Official result posted. Half marathon complete before the deadline.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch(`/api/promises/${slug}/proof`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ proofUrl, resultUrl, note }) });
    const body = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(body.error ?? "Add proof and try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) return <main className="proofSubmitted"><div className="brandMark proofMark"><BackedMark/></div><p className="eyebrow">PROOF SUBMITTED<span>.</span></p><h1>NOW<br/>WE VERIFY<span>.</span></h1><p>{name}&apos;s proof is in manual BACKED review. Backing is not released until the Proof is approved.</p><div className="proofStatus"><span>PROOF RECEIVED</span><span>ADMIN REVIEW NEXT</span><span>RELEASE LOCKED</span></div><Link className="button primary" href={`/p/${slug}`}>SEE PROMISE <Arrow/></Link></main>;

  return <main className="proofPage">
    <header><BackedLogo/><Link href={`/p/${slug}`}>CANCEL</Link></header>
    <form onSubmit={submit}>
      <section className="proofIntro">
        <p className="eyebrow">SUBMIT PROOF · {name.toUpperCase()}</p>
        <h1>PROVE<br/>THE PROMISE<span>.</span></h1>
        <p>{promiseTitle}</p>
      </section>
      <section className="proofFields">
        <label>OFFICIAL RESULT OR EVIDENCE LINK<input value={proofUrl} onChange={event=>setProofUrl(event.target.value)} placeholder="https://"/></label>
        <label>SECONDARY LINK · OPTIONAL<input value={resultUrl} onChange={event=>setResultUrl(event.target.value)} placeholder="https://"/></label>
        <label>WHAT SHOULD REVIEWERS KNOW?<textarea maxLength={500} value={note} onChange={event=>setNote(event.target.value)}/></label>
        {error && <p className="formError" role="alert">{error}</p>}
        <p className="safetyCopy">Alpha preview: submitting Proof moves the Promise to manual review. It does not release backing or collect money.</p>
      </section>
      <footer><span>PROOF BEFORE RELEASE.</span><button className="button primary" disabled={busy} type="submit">{busy ? "SUBMITTING..." : "SUBMIT PROOF"}<Arrow/></button></footer>
    </form>
  </main>;
}
