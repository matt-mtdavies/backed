import Link from "next/link";
import { notFound } from "next/navigation";
import { BackingSheet } from "@/components/backing/BackingSheet";
import { demoPromise } from "@/lib/demo";
import { getPromiseBySlug } from "@/lib/promises/get-promise";
import { getDb } from "@/lib/db/client";
import { createPromiseViewRepository } from "@/lib/db/get-promise-repositories";
import { Arrow } from "@/components/icons/Arrow";

export default async function BackPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const achieverName = slug === demoPromise.slug
    ? demoPromise.owner
    : (await getPromiseBySlug(slug, { promises: createPromiseViewRepository(getDb()) }))?.achieverName;
  if (!achieverName) notFound();
  return <main className="sheetPage"><Link href={`/p/${slug}`} className="closeLink" aria-label="Back to promise"><Arrow direction="w"/> BACK</Link><BackingSheet slug={slug} achieverName={achieverName}/></main>;
}
