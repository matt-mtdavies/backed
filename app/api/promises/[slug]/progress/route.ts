import { createProgressUpdate } from "@/lib/progress/create-progress-update";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = (await request.json()) as { headline?: string; caption?: string; distanceKm?: number; elapsedSeconds?: number; activityDate?: string };
  try {
    const update = await createProgressUpdate(
      { promiseId: slug, promiseState: "active", headline: body.headline ?? "", caption: body.caption, distanceKm: body.distanceKm, elapsedSeconds: body.elapsedSeconds, activityDate: body.activityDate },
      { progress: { create: async () => ({ id: crypto.randomUUID() }) }, capture: async () => undefined, now: () => new Date() },
    );
    return Response.json(update, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to post progress" }, { status: 400 });
  }
}
