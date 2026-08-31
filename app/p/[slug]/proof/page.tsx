import { notFound } from "next/navigation";
import { demoPromise } from "@/lib/demo";
import { ProofSubmissionFlow } from "@/components/proofs/ProofSubmissionFlow";

export const metadata = { title: "Submit Proof | BACKED", robots: { index: false, follow: false } };

export default async function ProofPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== demoPromise.slug) notFound();
  return <ProofSubmissionFlow slug={slug} name={demoPromise.owner} promiseTitle={demoPromise.title} />;
}
