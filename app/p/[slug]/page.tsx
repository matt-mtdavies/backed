import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demoPromise } from "@/lib/demo";
import { BackedLogo } from "@/components/brand/BackedLogo";
import { WallOfBelief } from "@/components/wall/WallOfBelief";
import { CompletionMoment } from "@/components/promise/CompletionMoment";
import { getPromiseBySlug } from "@/lib/promises/get-promise";
import { getDb } from "@/lib/db/client";
import { createPromiseViewRepository } from "@/lib/db/get-promise-repositories";
import { currencySymbol } from "@/lib/money/currency";
import { toneForIndex, relativeDaysAgoLabel } from "@/lib/promises/wall-presentation";
import { Arrow } from "@/components/icons/Arrow";
import Link from "next/link";

const NOT_YET_LIVE_STATES = new Set(["proposed", "declined", "expired", "cancelled_by_admin"]);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === demoPromise.slug) {
    return { title: "Jason is running his first half marathon | BACKED", description: "$1,100 behind Jason. 5 people are behind him.", robots: { index: false, follow: false }, alternates: { canonical: `/p/${slug}` }, openGraph: { title: "Jason is running his first half marathon", description: "$1,100 behind Jason. 5 people are behind him." }, twitter: { card: "summary_large_image", title: "Jason is running his first half marathon", description: "$1,100 behind Jason. 5 people are behind him." } };
  }
  const promise = await getPromiseBySlug(slug, { promises: createPromiseViewRepository(getDb()) });
  if (!promise) return { title: "Promise | BACKED" };
  const title = `${promise.achieverName} · ${promise.title}`;
  const description = `${promise.backers.length} ${promise.backers.length === 1 ? "person is" : "people are"} behind ${promise.achieverName}.`;
  return {
    title: `${title} | BACKED`,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: `/p/${slug}` },
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PromisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === demoPromise.slug) {
    const p = demoPromise;
    return <main className="promisePage"><header className="promiseNav"><BackedLogo/><span>JASON’S PROMISE</span></header><section className="promiseHero"><p className="eyebrow">RUNNING · JUNE 30</p><h1>RUN MY FIRST<br/>HALF MARATHON</h1><div className="promiseStats"><div><strong>${p.total.toLocaleString()}</strong><span>behind Jason.</span></div><div className="progressRing" aria-label={`${p.progress}% progress`}><b>{p.progress}%</b><span>PROGRESS</span></div></div><p className="beliefCount"><b>{p.backers.length} people</b> are behind Jason.</p><Link className="button primary stickyCta" href={`/p/${p.slug}/back`}>GET BEHIND JASON <Arrow direction="ne"/></Link></section><WallOfBelief achieverName="Jason" backers={p.backers.map((backer) => ({ name: backer.name, amountLabel: `$${backer.amount}`, message: backer.message, tone: backer.tone, agoLabel: "BACKED 42 DAYS AGO." }))}/><section className="updates"><div className="sectionTitle"><p className="eyebrow">THE WORK</p><div className="promiseOwnerActions"><Link href={`/p/${p.slug}/progress/new`}>POST PROGRESS <Arrow/></Link><Link href={`/p/${p.slug}/proof`}>SUBMIT PROOF <Arrow/></Link></div></div>{p.updates.map((update,index)=><article key={update}><span>0{index+1}</span><h2>{update}</h2><small>{index===0?"10.0 KM · 54:12":"18.2 KM · 1:44:23"}</small></article>)}</section></main>;
  }

  const promise = await getPromiseBySlug(slug, { promises: createPromiseViewRepository(getDb()) });
  if (!promise || NOT_YET_LIVE_STATES.has(promise.state)) notFound();

  const total = promise.totalAmountMinor / 100;
  const wallBackers = promise.backers.map((backer, index) => ({
    name: backer.name,
    amountLabel: `${currencySymbol(promise.currency)}${(backer.amountMinor / 100).toLocaleString()}`,
    message: backer.message,
    tone: toneForIndex(index),
    agoLabel: relativeDaysAgoLabel(backer.createdAt),
  }));

  return <main className="promisePage">
    <header className="promiseNav"><BackedLogo/><span>{promise.achieverName.toUpperCase()}’S PROMISE</span></header>
    {promise.state === "completed" ? (
      <CompletionMoment
        achieverName={promise.achieverName}
        title={promise.title}
        totalAmountMinor={promise.totalAmountMinor}
        currency={promise.currency}
        backers={promise.backers.map((backer) => ({ name: backer.name, amountMinor: backer.amountMinor }))}
        allBackingReleased={promise.allBackingReleased}
      />
    ) : (
      <section className="promiseHero">
        <p className="eyebrow">{promise.targetLabel ? promise.targetLabel.toUpperCase() : "PROMISE"} · {promise.deadline.toUpperCase()}</p>
        <h1>{promise.title.toUpperCase()}</h1>
        <div className="promiseStats">
          <div><strong>{currencySymbol(promise.currency)}{total.toLocaleString()}</strong><span>behind {promise.achieverName}.</span></div>
        </div>
        <p className="beliefCount"><b>{promise.backers.length} {promise.backers.length === 1 ? "person" : "people"}</b> {promise.backers.length === 1 ? "is" : "are"} behind {promise.achieverName}.</p>
        <Link className="button primary stickyCta" href={`/p/${slug}/back`}>GET BEHIND {promise.achieverName.toUpperCase()} <Arrow direction="ne"/></Link>
      </section>
    )}
    <WallOfBelief achieverName={promise.achieverName} backers={wallBackers}/>
  </main>;
}
