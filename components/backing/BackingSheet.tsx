"use client";
import { useState } from "react";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { currencySymbol } from "@/lib/money/currency";
import type { ValidationErrors } from "@/lib/validation/add-backing";

export function BackingSheet({ slug, achieverName }: { slug: string; achieverName: string }) {
  const [backerName, setBackerName] = useState("");
  const [amount, setAmount] = useState(50);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [done, setDone] = useState(false);
  const currency = "USD" as const;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setFailure(""); setErrors({});
    try {
      const response = await fetch(`/api/promises/${slug}/back`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ backerName, amountMinor: Math.round(amount * 100), currency, message: message || undefined }),
      });
      const body = await response.json() as { error?: string; errors?: ValidationErrors };
      if (!response.ok) { setErrors(body.errors ?? {}); throw new Error(body.error ?? "Please check the details and try again."); }
      setDone(true);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) return <div className="confirmed" role="status"><p>YOU’RE BEHIND {achieverName.toUpperCase()}.</p><strong>{currencySymbol(currency)}{amount}</strong><span>Belief made tangible.</span></div>;

  return <form className="backingForm" onSubmit={submit}>
    <p className="eyebrow">GET BEHIND {achieverName.toUpperCase()}</p>
    <h1>How much<br/>do you believe?</h1>
    <label className="flowField"><span>Your name</span><input value={backerName} onChange={(event) => setBackerName(event.target.value)} placeholder="Sarah" autoComplete="name"/>{errors.backerName && <small role="alert">{errors.backerName}</small>}</label>
    <div className="amounts" aria-label="Backing amount">{[25,50,100,250].map((value) => <button aria-pressed={amount===value} onClick={() => setAmount(value)} type="button" key={value}>${value}</button>)}</div>
    <MoneyInput value={amount} currency={currency} onChange={setAmount} />
    {errors.amountMinor && <small role="alert">{errors.amountMinor}</small>}
    <label>Say something they’ll need.<textarea maxLength={280} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="You’ve got this."/></label>
    <p className="commitmentNote">Alpha demo — this creates a conditional backing commitment; no payment is collected.</p>
    {failure && <p className="formError" role="alert">{failure}</p>}
    <button className="button primary submit" type="submit" disabled={busy}>{busy ? "BACKING…" : `BACK ${achieverName.toUpperCase()} $${amount}`}</button>
  </form>;
}
