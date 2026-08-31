export type ProgressUpdateInput = {
  promiseId: string;
  promiseState: "active" | "proof_pending" | "completed" | "failed" | "expired";
  headline: string;
  caption?: string;
  distanceKm?: number;
  elapsedSeconds?: number;
  activityDate?: string;
};

export interface ProgressUpdateRepository {
  create(input: ProgressUpdateInput & { createdAt: string }): Promise<{ id: string }>;
}

export async function createProgressUpdate(
  input: ProgressUpdateInput,
  deps: {
    progress: ProgressUpdateRepository;
    capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
    now: () => Date;
  },
) {
  if (input.promiseState !== "active") throw new Error("Progress can only be posted to an active Promise");
  const headline = input.headline.trim();
  if (headline.length < 3 || headline.length > 80) throw new Error("Headline must be between 3 and 80 characters");
  if (input.distanceKm !== undefined && (input.distanceKm <= 0 || input.distanceKm > 500)) throw new Error("Distance is out of range");
  if (input.elapsedSeconds !== undefined && input.elapsedSeconds <= 0) throw new Error("Elapsed time must be positive");

  const createdAt = deps.now().toISOString();
  const update = await deps.progress.create({ ...input, headline, createdAt });
  await deps.capture("progress_posted", { promise_id: input.promiseId, progress_update_id: update.id });
  return { ...update, createdAt };
}
