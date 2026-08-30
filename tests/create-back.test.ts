import { describe, expect, it, vi } from "vitest";
import { createBack, type BackRecord, type InviteRecord } from "../lib/backs/create-back";
import type { CreateBackInput } from "../lib/backs/model";
import { AlphaMockPaymentProvider } from "../lib/payments/provider";
import { validateCreateBack } from "../lib/validation/create-back";

const valid: CreateBackInput={recipientFirstName:"Jason",recipientContact:"jason@example.com",templateKey:"first_half",promiseTitle:"Run my first half marathon",deadline:"2099-06-30",successCriteria:"Complete an official half marathon before the deadline.",verificationMethod:"Official race result",amountMinor:10000,currency:"USD",message:"You’ve got this."};

describe("Create Back validation",()=>{
  it("accepts the supported happy path",()=>expect(validateCreateBack(valid)).toEqual({}));
  it("links accessible errors to invalid fields",()=>{const errors=validateCreateBack({...valid,recipientContact:"nope",amountMinor:0,deadline:"2020-01-01"});expect(errors.recipientContact).toBeTruthy();expect(errors.amountMinor).toBeTruthy();expect(errors.deadline).toBeTruthy()});
});

describe("createBack service",()=>{
  it("separates Back, commitment, hashed invite, and analytics",async()=>{const backs:BackRecord[]=[];const invites:InviteRecord[]=[];const capture=vi.fn();const result=await createBack(valid,{backs:{insert:async record=>{backs.push(record)}},invites:{insert:async record=>{invites.push(record)}},payments:new AlphaMockPaymentProvider(),analytics:{capture},id:(()=>{let n=0;return()=>`id-${++n}`})(),token:()=>"plain-secret",hash:async value=>`hashed:${value}`,now:()=>new Date("2026-08-30T12:00:00Z")});expect(result).toMatchObject({backId:"id-1",inviteId:"id-2",state:"proposed",commitmentReference:"alpha_id-1"});expect(backs[0].state).toBe("proposed");expect(invites[0].tokenHash).toBe("hashed:plain-secret");expect(invites[0].tokenHash).not.toBe(result.inviteToken);expect(capture).toHaveBeenCalledWith("invite_sent",expect.objectContaining({amount_minor:10000}))});
  it("routes custom goals to manual review",async()=>{const result=await createBack({...valid,templateKey:"custom",promiseTitle:"Climb my local peak"},{backs:{insert:async()=>{}},invites:{insert:async()=>{}},payments:new AlphaMockPaymentProvider(),analytics:{capture:async()=>{}},id:()=>crypto.randomUUID(),token:()=>"secret",hash:async()=>"hash",now:()=>new Date()});expect(result.requiresManualReview).toBe(true)});
});
