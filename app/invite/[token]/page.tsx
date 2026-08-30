import { notFound } from "next/navigation";
import { ReceiveBack } from "@/components/invite/ReceiveBack";
import { demoInvite } from "@/lib/invites/demo";
import { getInviteByToken } from "@/lib/invites/get-invite";
import { getDb } from "@/lib/db/client";
import { createInviteViewRepository } from "@/lib/db/accept-promise-repositories";

const encoder = new TextEncoder();
const hex = (buffer: ArrayBuffer) => [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
const hash = async (value: string) => hex(await crypto.subtle.digest("SHA-256", encoder.encode(value)));

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token === demoInvite.token) return { title: "Matthew backed you | BACKED", description: "Matthew believes you can run your first half marathon." };
  return { title: "You’ve been backed | BACKED", description: "Someone believes in you. See what they’re backing." };
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token === demoInvite.token) {
    const invite = { achieverName: demoInvite.achieverName, promiseSlug: demoInvite.promiseSlug, promiseTitle: demoInvite.promiseTitle, deadline: demoInvite.deadline, amountMinor: demoInvite.amountMinor, currency: demoInvite.currency, message: demoInvite.message, backerName: demoInvite.backerName, accepted: false };
    return <ReceiveBack invite={invite} token={token} />;
  }

  const invite = await getInviteByToken(token, { hash, invites: createInviteViewRepository(getDb()), now: () => new Date() });
  if (!invite) notFound();
  return <ReceiveBack invite={invite} token={token} />;
}
