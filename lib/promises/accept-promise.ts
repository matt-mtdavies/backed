import { transitionPromise, type PromiseState } from "@/lib/state-machines/promise";
export interface PromiseAcceptanceRepository { setState(input:{inviteToken:string;state:PromiseState;acceptedAt:string;activatedAt:string}):Promise<void> }
export async function acceptPromise(inviteToken:string,deps:{promises:PromiseAcceptanceRepository;capture:(event:string,properties:Record<string,unknown>)=>Promise<void>;now:()=>Date}){
  if(inviteToken.length<8)throw new Error("Invalid invite token");
  const accepted=transitionPromise("proposed","accepted");const active=transitionPromise(accepted,"active");const timestamp=deps.now().toISOString();
  await deps.promises.setState({inviteToken,state:active,acceptedAt:timestamp,activatedAt:timestamp});await deps.capture("promise_accepted",{invite_token:inviteToken});
  return {state:active,acceptedAt:timestamp};
}
