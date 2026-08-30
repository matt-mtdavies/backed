import { describe, expect, it, vi } from "vitest";
import { createProgressUpdate } from "@/lib/progress/create-progress-update";

describe("createProgressUpdate", () => {
  it("creates progress on an active Promise and captures the event", async () => {
    const create = vi.fn().mockResolvedValue({ id: "update-1" });
    const capture = vi.fn().mockResolvedValue(undefined);
    const result = await createProgressUpdate({ promiseId: "promise-1", promiseState: "active", headline: "  LONGEST RUN YET.  ", distanceKm: 18.2 }, { progress: { create }, capture, now: () => new Date("2026-08-30T12:00:00Z") });
    expect(result.id).toBe("update-1");
    expect(create).toHaveBeenCalledWith(expect.objectContaining({ headline: "LONGEST RUN YET.", createdAt: "2026-08-30T12:00:00.000Z" }));
    expect(capture).toHaveBeenCalledWith("progress_posted", { promise_id: "promise-1", progress_update_id: "update-1" });
  });

  it("rejects progress when the Promise is no longer active", async () => {
    await expect(createProgressUpdate({ promiseId: "promise-1", promiseState: "completed", headline: "Done" }, { progress: { create: vi.fn() }, capture: vi.fn(), now: () => new Date() })).rejects.toThrow("active Promise");
  });
});
