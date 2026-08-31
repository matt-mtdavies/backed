import { notFound } from "next/navigation";
import { demoPromise } from "@/lib/demo";
import { ProgressComposer } from "@/components/progress/ProgressComposer";

export const metadata = { title: "Post progress | BACKED", robots: { index: false, follow: false } };

export default async function NewProgressPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== demoPromise.slug) notFound();
  return <ProgressComposer slug={slug} name={demoPromise.owner} />;
}
