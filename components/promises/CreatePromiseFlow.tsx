"use client";

import { useState } from "react";
import Link from "next/link";
import { promiseTemplates } from "@/lib/backs/model";
import { type CreatePromiseErrors, type CreatePromiseInput, type CreatePromiseResult, validateCreatePromise } from "@/lib/promises/create-promise";
import { BackedMark } from "@/components/brand/BackedMark";
import { BrandedDatePicker } from "@/components/forms/BrandedDatePicker";
import { Arrow } from "@/components/icons/Arrow";

const initial: CreatePromiseInput = { achieverFirstName:"",achieverLastName:"",achieverContact:"",templateKey:"first_half",promiseTitle:"Run my first half marathon",deadline:"",successCriteria:"Complete an official half marathon before the deadline.",verificationMethod:"Official race result" };
const labels = ["You", "Promise", "Review"];

export function CreatePromiseFlow() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState<CreatePromiseErrors>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const [result, setResult] = useState<CreatePromiseResult | null>(null);

  const update = <K extends keyof CreatePromiseInput>(key: K, value: CreatePromiseInput[K]) => { setData(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const next = () => {
    const all = validateCreatePromise(data);
    const relevant: CreatePromiseErrors = {};
    const keys: Record<number, (keyof CreatePromiseInput)[]> = { 0: ["achieverFirstName", "achieverContact"], 1: ["templateKey", "promiseTitle", "deadline", "successCriteria", "verificationMethod"], 2: [] };
    keys[step].forEach(key => { if (all[key]) relevant[key] = all[key]; });
    if (Object.keys(relevant).length) { setErrors(relevant); return; }
    setStep(value => Math.min(2, value + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const submit = async () => {
    const validation = validateCreatePromise(data);
    if (Object.keys(validation).length) { setErrors(validation); return; }
    setBusy(true);
    setFailure("");
    try {
      const response = await fetch("/api/promises", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const body = await response.json() as CreatePromiseResult & { error?: string; errors?: CreatePromiseErrors };
      if (!response.ok) { setErrors(body.errors ?? {}); throw new Error(body.error ?? "Please check the details and try again."); }
      setResult(body);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (result) return <section className="inviteMoment promiseCreated"><div className="brandMark big"><BackedMark/></div><p className="eyebrow">PROMISE CREATED · SHARE READY</p><h1>{data.achieverFirstName.toUpperCase()}<br/>CAN DO THIS<span>.</span></h1><p>{data.promiseTitle}</p><div className="inviteStatus"><span>Promise proposed</span><span>{result.requiresManualReview ? "Manual review required" : "Ready to share"}</span><span>No backing yet</span></div><p className="alphaNotice light">Alpha preview: this creates your Promise without collecting money. Invite people to put something behind you next.</p><Link className="button primary" href={`/p/${result.promiseSlug}`}>SEE PROMISE <Arrow/></Link></section>;

  return <section className="flowShell promiseFlow"><header className="flowHeader"><div><p className="eyebrow">MAKE A PROMISE</p><span>{String(step + 1).padStart(2, "0")} / 03</span></div><ol aria-label="Progress">{labels.map((label, index) => <li className={index === step ? "active" : index < step ? "done" : ""} key={label}><i/><span>{label}</span></li>)}</ol></header>
    <div className="flowPanel">
      {step === 0 && <div className="flowStep"><p className="eyebrow">THE PERSON</p><h1>WHAT WILL<br/>YOU DO<span>?</span></h1><p className="stepIntro">Start with you. People can back the Promise after it exists.</p><div className="fieldGrid two"><Field label="First name" error={errors.achieverFirstName}><input value={data.achieverFirstName} onChange={event=>update("achieverFirstName", event.target.value)} autoComplete="given-name" placeholder="Jason"/></Field><Field label="Last name · optional"><input value={data.achieverLastName} onChange={event=>update("achieverLastName", event.target.value)} autoComplete="family-name" placeholder="Morgan"/></Field></div><Field label="Email or mobile" error={errors.achieverContact}><input value={data.achieverContact} onChange={event=>update("achieverContact", event.target.value)} autoComplete="email" placeholder="jason@example.com"/></Field></div>}
      {step === 1 && <div className="flowStep"><p className="eyebrow">THE PROMISE</p><h1>MAKE IT<br/>TANGIBLE<span>.</span></h1><div className="templateGrid">{promiseTemplates.map(item => <button type="button" className={data.templateKey === item.key ? "selected" : ""} onClick={()=>{update("templateKey", item.key); if (item.key !== "custom") update("promiseTitle", item.label);}} key={item.key}><i/>{item.label}</button>)}</div><Field label="Promise title" error={errors.promiseTitle}><input maxLength={100} value={data.promiseTitle} onChange={event=>update("promiseTitle", event.target.value)}/></Field><div className="fieldGrid two"><Field label="Deadline" error={errors.deadline}><BrandedDatePicker value={data.deadline} onChange={value=>update("deadline", value)}/></Field><Field label="Verification" error={errors.verificationMethod}><input maxLength={200} value={data.verificationMethod} onChange={event=>update("verificationMethod", event.target.value)}/></Field></div><Field label="What counts as success?" error={errors.successCriteria}><textarea maxLength={400} value={data.successCriteria} onChange={event=>update("successCriteria", event.target.value)}/></Field></div>}
      {step === 2 && <div className="flowStep reviewStep"><p className="eyebrow">REVIEW YOUR PROMISE</p><div className="reviewPerson"><span>FOR</span><h1>{data.achieverFirstName.toUpperCase()}</h1><button onClick={()=>setStep(0)}>EDIT</button></div><div className="reviewPromise"><span>YOU WILL</span><h2>{data.promiseTitle}</h2><p>by {new Date(`${data.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p><button onClick={()=>setStep(1)}>EDIT</button></div><p className="safetyCopy">Continuing creates your proposed Promise. No Back, BackingCommitment, or PaymentEvent is created until someone backs you.</p>{failure && <p className="formError" role="alert">{failure}</p>}</div>}
    </div><footer className="flowActions">{step > 0 && <button className="backButton" onClick={()=>setStep(value=>value-1)}><Arrow direction="w"/> BACK</button>}<button className="button primary" disabled={busy} onClick={step === 2 ? submit : next}>{busy ? "CREATING..." : step === 2 ? "CREATE PROMISE" : "CONTINUE"}<Arrow/></button></footer>
  </section>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="flowField"><span>{label}</span>{children}{error && <small role="alert">{error}</small>}</label>;
}
