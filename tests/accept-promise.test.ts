import {describe,expect,it,vi} from "vitest";
import {acceptPromise,InvalidInviteError,InviteExpiredError,type ActiveInvite} from "../lib/promises/accept-promise";

const baseInvite: ActiveInvite = { inviteId:"invite-1", backId:"back-1", promiseId:"promise-1", promiseState:"proposed", backState:"proposed", expiresAt:"2099-01-01T00:00:00.000Z", acceptedAt:null };

function makeDeps(invite: ActiveInvite | null) {
  const setPromiseState = vi.fn();
  const setBackState = vi.fn();
  const markAccepted = vi.fn();
  const capture = vi.fn();
  return {
    setPromiseState,setBackState,markAccepted,capture,
    deps: {
      hash: async (token: string) => `hashed:${token}`,
      invites: { findActiveByTokenHash: async () => invite, markAccepted: async (id: string, acceptedAt: string) => { markAccepted(id, acceptedAt) } },
      promises: { setState: async (input: unknown) => { setPromiseState(input) } },
      backs: { setState: async (input: unknown) => { setBackState(input) } },
      capture: async (event: string, properties: Record<string, unknown>) => { capture(event, properties) },
      now: () => new Date("2026-08-30T18:00:00Z"),
    },
  };
}

describe("acceptPromise",()=>{
  it("activates through explicit transitions and records analytics",async()=>{
    const { setPromiseState, setBackState, markAccepted, capture, deps } = makeDeps(baseInvite);
    const result = await acceptPromise("valid-demo-token", deps);
    expect(result.state).toBe("active");
    expect(setPromiseState).toHaveBeenCalledWith(expect.objectContaining({ promiseId:"promise-1", state:"active", acceptedAt:"2026-08-30T18:00:00.000Z" }));
    expect(setBackState).toHaveBeenCalledWith({ backId:"back-1", state:"committed" });
    expect(markAccepted).toHaveBeenCalledWith("invite-1", "2026-08-30T18:00:00.000Z");
    expect(capture).toHaveBeenCalledWith("promise_accepted", { promise_id:"promise-1", back_id:"back-1" });
  });
  it("rejects malformed tokens",async()=>{
    const { deps } = makeDeps(null);
    await expect(acceptPromise("short", deps)).rejects.toThrow(InvalidInviteError);
  });
  it("rejects tokens that don't match any invite",async()=>{
    const { deps } = makeDeps(null);
    await expect(acceptPromise("valid-demo-token", deps)).rejects.toThrow(InvalidInviteError);
  });
  it("rejects expired invites",async()=>{
    const { deps } = makeDeps({ ...baseInvite, expiresAt:"2020-01-01T00:00:00.000Z" });
    await expect(acceptPromise("valid-demo-token", deps)).rejects.toThrow(InviteExpiredError);
  });
  it("is idempotent for an already-accepted invite",async()=>{
    const { setPromiseState, deps } = makeDeps({ ...baseInvite, promiseState:"active", acceptedAt:"2026-08-29T00:00:00.000Z" });
    const result = await acceptPromise("valid-demo-token", deps);
    expect(result).toEqual({ state:"active", acceptedAt:"2026-08-29T00:00:00.000Z" });
    expect(setPromiseState).not.toHaveBeenCalled();
  });
});
