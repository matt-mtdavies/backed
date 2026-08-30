export type CommitmentResult = { providerReference: string; state: "pending" | "confirmed" };
export interface PaymentProvider {
  createCommitment(input: { backId: string; amountMinor: number; currency: string }): Promise<CommitmentResult>;
  confirmCommitment(id: string): Promise<CommitmentResult>;
  markPayable(id: string): Promise<void>;
  release(id: string): Promise<{ providerReference: string }>;
  cancel(id: string): Promise<void>;
  returnFunds(id: string): Promise<void>;
}
export class AlphaMockPaymentProvider implements PaymentProvider {
  async createCommitment({backId}:{backId:string}) { return {providerReference:`alpha_${backId}`,state:"pending" as const}; }
  async confirmCommitment(id:string) { return {providerReference:id,state:"confirmed" as const}; }
  async markPayable() {} async release(id:string) { return {providerReference:id}; } async cancel() {} async returnFunds() {}
}
