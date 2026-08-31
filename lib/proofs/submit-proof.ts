import { transitionPromise, type PromiseState } from "@/lib/state-machines/promise";

export type ProofSubmissionInput = {
  promiseId: string;
  promiseState: PromiseState;
  submittedBy: string;
  proofUrl?: string;
  resultUrl?: string;
  note?: string;
};

export interface ProofSubmissionRepository {
  create(input: {
    id: string;
    promiseId: string;
    submittedBy: string;
    proofUrl: string | null;
    resultUrl: string | null;
    note: string | null;
    state: "pending";
    createdAt: string;
  }): Promise<void>;
}

export interface ProofPromiseRepository {
  setProofPending(input: { promiseId: string; proofSubmittedAt: string; state: "proof_pending" }): Promise<void>;
}

type Dependencies = {
  proofs: ProofSubmissionRepository;
  promises: ProofPromiseRepository;
  capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
  id: () => string;
  now: () => Date;
};

export class ProofSubmissionValidationError extends Error {}

export async function submitProof(input: ProofSubmissionInput, deps: Dependencies) {
  const proofUrl = normalize(input.proofUrl);
  const resultUrl = normalize(input.resultUrl);
  const note = normalize(input.note);

  if (!proofUrl && !resultUrl && !note) throw new ProofSubmissionValidationError("Add a proof link, result link, or note.");
  if (proofUrl && !isHttpUrl(proofUrl)) throw new ProofSubmissionValidationError("Proof link must be a valid URL.");
  if (resultUrl && !isHttpUrl(resultUrl)) throw new ProofSubmissionValidationError("Result link must be a valid URL.");
  if (note && note.length > 500) throw new ProofSubmissionValidationError("Proof note must be 500 characters or less.");

  const state = transitionPromise(input.promiseState, "proof_pending");
  if (state !== "proof_pending") throw new ProofSubmissionValidationError("Proof could not be submitted for this Promise.");
  const proofId = deps.id();
  const createdAt = deps.now().toISOString();

  await deps.proofs.create({ id: proofId, promiseId: input.promiseId, submittedBy: input.submittedBy, proofUrl, resultUrl, note, state: "pending", createdAt });
  await deps.promises.setProofPending({ promiseId: input.promiseId, proofSubmittedAt: createdAt, state });
  await deps.capture("proof_submitted", { proof_id: proofId, promise_id: input.promiseId });

  return { proofId, state, submittedAt: createdAt };
}

function normalize(value?: string) {
  const next = value?.trim();
  return next ? next : null;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
