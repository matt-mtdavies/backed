export const promiseStates = ["proposed","accepted","active","proof_pending","verified","completed","declined","expired","ended_unverified","cancelled_by_admin"] as const;
export type PromiseState = (typeof promiseStates)[number];

const transitions: Record<PromiseState, readonly PromiseState[]> = {
  proposed: ["accepted", "declined", "expired", "cancelled_by_admin"],
  accepted: ["active", "cancelled_by_admin"],
  active: ["proof_pending", "expired", "ended_unverified", "cancelled_by_admin"],
  proof_pending: ["verified", "active", "ended_unverified", "cancelled_by_admin"],
  verified: ["completed", "cancelled_by_admin"], completed: [], declined: [], expired: [], ended_unverified: [], cancelled_by_admin: [],
};

export function transitionPromise(from: PromiseState, to: PromiseState): PromiseState {
  if (!transitions[from].includes(to)) throw new Error(`Invalid promise transition: ${from} → ${to}`);
  return to;
}
