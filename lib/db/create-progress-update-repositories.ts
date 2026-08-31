import { progressUpdates } from "@/db/schema";
import type { ProgressUpdateRepository } from "@/lib/progress/create-progress-update";
import type { DbOrTx } from "./tx";

export function createProgressUpdateRepository(db: DbOrTx, authorUserId: string): ProgressUpdateRepository {
  return {
    async create(input) {
      const [row] = await db
        .insert(progressUpdates)
        .values({
          promiseId: input.promiseId,
          authorUserId,
          title: input.headline,
          body: input.caption ?? null,
          activityDistanceM: input.distanceKm !== undefined ? Math.round(input.distanceKm * 1000) : null,
          activityDurationS: input.elapsedSeconds !== undefined ? Math.round(input.elapsedSeconds) : null,
          activityDate: input.activityDate ?? null,
        })
        .returning({ id: progressUpdates.id });
      return { id: row.id };
    },
  };
}
