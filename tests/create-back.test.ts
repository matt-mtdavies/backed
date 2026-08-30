import { describe, expect, it, vi } from "vitest";
import { createBack } from "../lib/backs/create-back";
import type { CreateBackInput, NewUserRecord, NewPromiseRecord, NewBackRecord, NewInviteRecord } from "../lib/backs/model";
import { AlphaMockPaymentProvider } from "../lib/payments/provider";
import { validateCreateBack } from "../lib/validation/create-back";
import { resolveCurrency } from "../lib/money/currency";

const valid: CreateBackInput={backerName:"Matthew",achieverFirstName:"Jason",achieverContact:"jason@example.com",templateKey:"first_half",promiseTitle:"Run my first half marathon",deadline:"2099-06-30",successCriteria:"Complete an official half marathon before the deadline.",verificationMethod:"Official race result",amountMinor:10000,currency:"USD",message:"You’ve got this."};

const nextId = () => { let n = 0; return () => `id-${++n}` };

function makeDeps(overrides: { existingUser?: { id: string } } = {}) {
  const users: NewUserRecord[] = [];
  const promises: NewPromiseRecord[] = [];
  const backs: NewBackRecord[] = [];
  const invites: NewInviteRecord[] = [];
  const capture = vi.fn();
  return {
    users,promises,backs,invites,capture,
    deps: {
      users: { findByContact: async () => overrides.existingUser ?? null, insert: async (record: NewUserRecord) => { users.push(record) } },
      promises: { insert: async (record: NewPromiseRecord) => { promises.push(record) } },
      backs: { insert: async (record: NewBackRecord) => { backs.push(record) } },
      invites: { insert: async (record: NewInviteRecord) => { invites.push(record) } },
      payments: new AlphaMockPaymentProvider(),
      analytics: { capture },
      id: nextId(),
      token: () => "plain-secret",
      hash: async (value: string) => `hashed:${value}`,
      now: () => new Date("2026-08-30T12:00:00Z"),
    },
  };
}

describe("Create Back validation",()=>{
  it("accepts the supported happy path",()=>expect(validateCreateBack(valid)).toEqual({}));
  it("links accessible errors to invalid fields",()=>{const errors=validateCreateBack({...valid,achieverContact:"nope",amountMinor:0,deadline:"2020-01-01",backerName:"x"});expect(errors.achieverContact).toBeTruthy();expect(errors.amountMinor).toBeTruthy();expect(errors.deadline).toBeTruthy();expect(errors.backerName).toBeTruthy()});
  it("rejects titles and descriptions long enough to break the promise page's display",()=>{const errors=validateCreateBack({...valid,promiseTitle:"x".repeat(101),successCriteria:"x".repeat(401),verificationMethod:"x".repeat(201)});expect(errors.promiseTitle).toBeTruthy();expect(errors.successCriteria).toBeTruthy();expect(errors.verificationMethod).toBeTruthy()});
});

describe("currency defaults",()=>{it("prefers profile currency over locale",()=>{expect(resolveCurrency("CAD","en-US")).toBe("CAD")});it("uses locale until a profile exists",()=>{expect(resolveCurrency(undefined,"en-CA")).toBe("CAD");expect(resolveCurrency(undefined,"en-US")).toBe("USD")})});

describe("createBack service",()=>{
  it("creates a Promise with a structured target, a Back, a hashed invite, and records analytics",async()=>{
    const { users, promises, backs, invites, capture, deps } = makeDeps();
    const result = await createBack(valid, deps);
    expect(result).toMatchObject({ backId:"id-3", inviteId:"id-4", state:"proposed", commitmentReference:"alpha_id-3" });
    expect(users[0]).toMatchObject({ id:"id-1", email:"jason@example.com", firstName:"Jason" });
    expect(promises[0]).toMatchObject({ id:"id-2", achieverUserId:"id-1", state:"proposed", title: valid.promiseTitle, targetType:"distance", targetValue:21.1, targetUnit:"km" });
    expect(backs[0]).toMatchObject({ id:"id-3", promiseId:"id-2", achieverUserId:"id-1", backerName:"Matthew", state:"proposed" });
    expect(invites[0].tokenHash).toBe("hashed:plain-secret");
    expect(invites[0].tokenHash).not.toBe(result.inviteToken);
    expect(capture).toHaveBeenCalledWith("invite_sent", expect.objectContaining({ amount_minor:10000 }));
  });
  it("reuses an existing user instead of creating a duplicate",async()=>{
    const { users, promises, deps } = makeDeps({ existingUser: { id: "existing-user" } });
    await createBack(valid, deps);
    expect(users).toHaveLength(0);
    expect(promises[0].achieverUserId).toBe("existing-user");
  });
  it("leaves target fields null for custom goals",async()=>{
    const { promises, deps } = makeDeps();
    await createBack({...valid,templateKey:"custom",promiseTitle:"Climb my local peak"}, deps);
    expect(promises[0]).toMatchObject({ targetType:null, targetValue:null, targetUnit:null });
  });
  it("routes custom goals to manual review",async()=>{
    const { deps } = makeDeps();
    const result = await createBack({...valid,templateKey:"custom",promiseTitle:"Climb my local peak"}, deps);
    expect(result.requiresManualReview).toBe(true);
  });
});
