"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BackedLogo } from "@/components/brand/BackedLogo";

export function ProgressComposer({ slug, name }: { slug: string; name: string }) {
  const [headline, setHeadline] = useState("LONGEST RUN YET.");
  const [distance, setDistance] = useState("18.2");
  const [elapsed, setElapsed] = useState("1:44:23");
  const [activityDate, setActivityDate] = useState(new Date().toISOString().slice(0, 10));
  const [caption, setCaption] = useState("The early mornings are starting to add up.");
  const [imageUrl, setImageUrl] = useState<string>();
  const [posted, setPosted] = useState(false);
  const [busy, setBusy] = useState(false);
  const elapsedSeconds = useMemo(() => elapsed.split(":").reduce((total, part) => total * 60 + Number(part || 0), 0), [elapsed]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true);
    const response = await fetch(`/api/promises/${slug}/progress`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ headline, caption, distanceKm: Number(distance), elapsedSeconds, activityDate }) });
    setBusy(false); if (response.ok) setPosted(true);
  }

  if (posted) return <main className="progressPosted"><BackedLogo/><p className="eyebrow">PROGRESS POSTED<span>.</span></p><h1>KEEP<br/>GOING<span>.</span></h1><div className="postedCard">{imageUrl && <img src={imageUrl} alt="Progress update preview"/>}<span>{activityDate}</span><h2>{headline}</h2><strong>{distance} KM <i>{elapsed}</i></strong><p>{caption}</p></div><p>Your people can now see the work you’re putting in.</p><Link className="button primary" href={`/p/${slug}`}>SEE YOUR PROMISE <span>→</span></Link></main>;

  return <main className="progressComposer"><header><BackedLogo/><Link href={`/p/${slug}`}>CANCEL</Link></header><form onSubmit={submit}><section className="progressIntro"><p className="eyebrow">POST PROGRESS · {name.toUpperCase()}</p><h1>SHOW<br/>THE WORK<span>.</span></h1><p>Progress makes belief tangible. Share the moment, not a perfect performance.</p></section><section className="progressFields"><label className="progressHeadline">WHAT HAPPENED?<input required maxLength={80} value={headline} onChange={event=>setHeadline(event.target.value)} /></label><div className="activityGrid"><label>DISTANCE · KM<input inputMode="decimal" value={distance} onChange={event=>setDistance(event.target.value)} /></label><label>ELAPSED TIME<input inputMode="numeric" value={elapsed} onChange={event=>setElapsed(event.target.value)} /></label><label>ACTIVITY DATE<input type="date" value={activityDate} onChange={event=>setActivityDate(event.target.value)} /></label></div><label>ADD A NOTE<textarea maxLength={280} value={caption} onChange={event=>setCaption(event.target.value)} /></label><label className={`mediaDrop ${imageUrl ? "hasImage" : ""}`}>{imageUrl ? <img src={imageUrl} alt="Selected progress update"/> : <><strong>ADD A PHOTO</strong><span>Optional · JPG or PNG</span></>}<input type="file" accept="image/jpeg,image/png" onChange={event=>{const file=event.target.files?.[0];if(file)setImageUrl(URL.createObjectURL(file))}} /></label><p className="safetyCopy">Alpha preview: the update uses temporary Worker memory and the photo is only previewed on this device. No notification has been sent.</p></section><footer><span>YOUR PEOPLE ARE BEHIND YOU.</span><button className="button primary" disabled={busy} type="submit">{busy ? "POSTING…" : "POST PROGRESS"}<b>↑</b></button></footer></form></main>;
}
