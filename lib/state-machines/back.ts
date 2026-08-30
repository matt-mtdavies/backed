export const backStates = ["proposed","committed","active","payable","released","declined","cancelled","expired","returned","payment_failed"] as const;
export type BackState = (typeof backStates)[number];
const transitions: Record<BackState, readonly BackState[]> = { proposed:["committed","declined","expired"], committed:["active","cancelled","expired","payment_failed"], active:["payable","cancelled","expired","payment_failed"], payable:["released","returned","payment_failed"], released:[], declined:[], cancelled:[], expired:[], returned:[], payment_failed:["committed","cancelled"] };
export function transitionBack(from: BackState, to: BackState): BackState { if (!transitions[from].includes(to)) throw new Error(`Invalid back transition: ${from} → ${to}`); return to; }
