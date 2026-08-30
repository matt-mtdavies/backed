import { notFound } from "next/navigation";import { ReceiveBack } from "@/components/invite/ReceiveBack";import { demoInvite } from "@/lib/invites/demo";
export const metadata={title:"Matthew backed you | BACKED",description:"Matthew believes you can run your first half marathon."};
export default async function InvitePage({params}:{params:Promise<{token:string}>}){const {token}=await params;if(token!==demoInvite.token)notFound();return <ReceiveBack invite={demoInvite}/>}
