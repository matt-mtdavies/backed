import { createProgressUpdate } from "@/lib/progress/create-progress-update";
import { getDb } from "@/lib/db/client";
import { createPromiseLookupRepository } from "@/lib/db/promise-lookup-repositories";
import { createProgressUpdateRepository } from "@/lib/db/create-progress-update-repositories";
import { demoPromise } from "@/lib/demo";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const body = (await request.json()) as { headline?: string; caption?: string; distanceKm?: number; elapsedSeconds?: number; activityDate?: string };

  try {
    if (slug === demoPromise.slug) {
      const update = await createProgressUpdate(
        { promiseId: demoPromise.slug, promiseState: "active", headline: body.headline ?? "", caption: body.caption, distanceKm: body.distanceKm, elapsedSeconds: body.elapsedSeconds, activityDate: body.activityDate },
        { progress: { create: async () => ({ id: crypto.randomUUID() }) }, capture: async () => undefined, now: () => new Date() },
      );
      return Response.json(update, { status: 201 });
    }

    if (!process.env.DATABASE_URL) return Response.json({ error: "This Promise could not be found." }, { status: 404 });

    const db = getDb();
    const promise = await createPromiseLookupRepository(db).findBySlug(slug);
    if (!promise) return Response.json({ error: "This Promise could not be found." }, { status: 404 });

    const update = await db.transaction((tx) =>
      createProgressUpdate(
        { promiseId: promise.id, promiseState: promise.state, headline: body.headline ?? "", caption: body.caption, distanceKm: body.distanceKm, elapsedSeconds: body.elapsedSeconds, activityDate: body.activityDate },
        { progress: createProgressUpdateRepository(tx, promise.achieverUserId), capture: async () => undefined, now: () => new Date() },
      )
    );
    return Response.json(update, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to post progress" }, { status: 400 });
  }
}
