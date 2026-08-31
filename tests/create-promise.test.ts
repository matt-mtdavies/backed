import { describe, expect, it, vi } from "vitest";
import { createPromise, validateCreatePromise, type CreatePromiseInput } from "@/lib/promises/create-promise";

const valid: CreatePromiseInput = {
  achieverFirstName: "Jason",
  achieverContact: "jason@example.com",
  templateKey: "first_half",
  promiseTitle: "Run my first half marathon",
  deadline: "2099-06-30",
  successCriteria: "Complete an official half marathon before the deadline.",
  verificationMethod: "Official race result",
};

describe("createPromise", () => {
  it("creates an Achiever-owned proposed Promise without Backing or payment state", async () => {
    const users = { findByContact: vi.fn(async () => null), insert: vi.fn(async () => {}) };
    const promises = { insert: vi.fn(async () => {}) };
    const capture = vi.fn(async () => {});
    let id = 0;

    const result = await createPromise(valid, {
      users,
      promises,
      capture,
      id: () => `id-${++id}`,
      now: () => new Date("2026-08-31T12:00:00Z"),
    });

    expect(result).toMatchObject({ promiseId: "id-2", promiseSlug: "jason-id2", state: "proposed", requiresManualReview: false });
    expect(users.insert).toHaveBeenCalledWith(expect.objectContaining({ id: "id-1", firstName: "Jason", email: "jason@example.com" }));
    expect(promises.insert).toHaveBeenCalledWith(expect.objectContaining({ achieverUserId: "id-1", createdByUserId: "id-1", state: "proposed", targetValue: 21.1 }));
    expect(capture).toHaveBeenCalledWith("promise_created", { promise_id: "id-2", template_key: "first_half" });
  });

  it("routes custom Promises to manual review", async () => {
    const result = await createPromise({ ...valid, templateKey: "custom", promiseTitle: "Build my first sculpture" }, {
      users: { findByContact: vi.fn(async () => ({ id: "existing-user" })), insert: vi.fn() },
      promises: { insert: vi.fn(async () => {}) },
      capture: vi.fn(),
      id: () => crypto.randomUUID(),
      now: () => new Date(),
    });
    expect(result.requiresManualReview).toBe(true);
  });

  it("validates contact, deadline, and measurable success", () => {
    const errors = validateCreatePromise({ ...valid, achieverFirstName: "J", achieverContact: "nope", deadline: "2020-01-01", successCriteria: "finish" });
    expect(errors.achieverFirstName).toBeTruthy();
    expect(errors.achieverContact).toBeTruthy();
    expect(errors.deadline).toBeTruthy();
    expect(errors.successCriteria).toBeTruthy();
  });
});
