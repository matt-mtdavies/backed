import { requiresManualReview } from "@/lib/moderation/rules";
import { buildPromiseSlug } from "@/lib/promises/slug";
import { emailPattern, phonePattern } from "@/lib/validation/shared";
import { promiseTemplates, type NewPromiseRecord, type NewUserRecord } from "@/lib/backs/model";

export type CreatePromiseInput = {
  achieverFirstName: string;
  achieverLastName?: string;
  achieverContact: string;
  templateKey: (typeof promiseTemplates)[number]["key"];
  promiseTitle: string;
  deadline: string;
  successCriteria: string;
  verificationMethod: string;
};

export type CreatePromiseResult = {
  promiseId: string;
  promiseSlug: string;
  state: "proposed";
  requiresManualReview: boolean;
};

export type CreatePromiseErrors = Partial<Record<keyof CreatePromiseInput, string>>;

export interface PromiseCreatorUserRepository {
  findByContact(contact: string): Promise<{ id: string } | null>;
  insert(record: NewUserRecord): Promise<void>;
}

export interface PromiseCreatorPromiseRepository {
  insert(record: NewPromiseRecord): Promise<void>;
}

type Dependencies = {
  users: PromiseCreatorUserRepository;
  promises: PromiseCreatorPromiseRepository;
  capture: (event: string, properties: Record<string, unknown>) => Promise<void>;
  id: () => string;
  now: () => Date;
};

export class CreatePromiseValidationError extends Error {
  constructor(public readonly errors: CreatePromiseErrors) { super("Invalid Promise"); }
}

export async function createPromise(input: CreatePromiseInput, deps: Dependencies): Promise<CreatePromiseResult> {
  assertValidCreatePromise(input);
  const createdAt = deps.now().toISOString();
  const existingUser = await deps.users.findByContact(input.achieverContact);
  const achieverUserId = existingUser?.id ?? deps.id();

  if (!existingUser) {
    const isEmail = emailPattern.test(input.achieverContact);
    await deps.users.insert({
      id: achieverUserId,
      email: isEmail ? input.achieverContact : undefined,
      phone: isEmail ? undefined : input.achieverContact,
      firstName: input.achieverFirstName,
      lastName: input.achieverLastName,
      displayName: [input.achieverFirstName, input.achieverLastName].filter(Boolean).join(" "),
    });
  }

  const promiseId = deps.id();
  const template = promiseTemplates.find((item) => item.key === input.templateKey);
  const promiseSlug = buildPromiseSlug(input.achieverFirstName, promiseId);
  await deps.promises.insert({
    id: promiseId,
    achieverUserId,
    createdByUserId: achieverUserId,
    title: input.promiseTitle,
    category: template?.category ?? "general",
    templateKey: input.templateKey,
    targetType: template?.targetType ?? null,
    targetValue: template?.targetValue ?? null,
    targetUnit: template?.targetUnit ?? null,
    deadline: `${input.deadline}T23:59:59Z`,
    successCriteria: input.successCriteria,
    verificationMethod: input.verificationMethod,
    slug: promiseSlug,
    state: "proposed",
    createdAt,
  });

  await deps.capture("promise_created", { promise_id: promiseId, template_key: input.templateKey });
  return { promiseId, promiseSlug, state: "proposed", requiresManualReview: requiresManualReview(input.promiseTitle, input.templateKey === "custom") };
}

export function validateCreatePromise(input: CreatePromiseInput): CreatePromiseErrors {
  const errors: CreatePromiseErrors = {};
  if (input.achieverFirstName.trim().length < 2) errors.achieverFirstName = "Enter your first name.";
  if (!emailPattern.test(input.achieverContact) && !phonePattern.test(input.achieverContact)) errors.achieverContact = "Enter a valid email or mobile number.";
  if (!promiseTemplates.some((item) => item.key === input.templateKey)) errors.templateKey = "Choose a Promise.";
  if (input.promiseTitle.trim().length < 5) errors.promiseTitle = "Describe what you will do.";
  else if (input.promiseTitle.trim().length > 100) errors.promiseTitle = "Keep the title under 100 characters.";
  if (!input.deadline || new Date(`${input.deadline}T23:59:59Z`) <= new Date()) errors.deadline = "Choose a future deadline.";
  if (input.successCriteria.trim().length < 10) errors.successCriteria = "Make success clear and measurable.";
  else if (input.successCriteria.trim().length > 400) errors.successCriteria = "Keep success criteria under 400 characters.";
  if (input.verificationMethod.trim().length < 5) errors.verificationMethod = "Explain how the Promise will be verified.";
  else if (input.verificationMethod.trim().length > 200) errors.verificationMethod = "Keep verification under 200 characters.";
  return errors;
}

export function assertValidCreatePromise(input: CreatePromiseInput) {
  const errors = validateCreatePromise(input);
  if (Object.keys(errors).length) throw new CreatePromiseValidationError(errors);
}
