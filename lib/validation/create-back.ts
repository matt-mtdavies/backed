import { promiseTemplates, type CreateBackInput } from "@/lib/backs/model";
import { supportedCurrencies } from "@/lib/money/currency";

export type ValidationErrors = Partial<Record<keyof CreateBackInput, string>>;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phone = /^\+?[\d\s().-]{8,}$/;

export function validateCreateBack(input: CreateBackInput): ValidationErrors {
  const errors: ValidationErrors = {};
  if (input.recipientFirstName.trim().length < 2) errors.recipientFirstName = "Enter their first name.";
  if (!email.test(input.recipientContact) && !phone.test(input.recipientContact)) errors.recipientContact = "Enter a valid email or mobile number.";
  if (!promiseTemplates.some((item) => item.key === input.templateKey)) errors.templateKey = "Choose a Promise.";
  if (input.promiseTitle.trim().length < 5) errors.promiseTitle = "Describe what you believe they can do.";
  if (!input.deadline || new Date(`${input.deadline}T23:59:59Z`) <= new Date()) errors.deadline = "Choose a future deadline.";
  if (input.successCriteria.trim().length < 10) errors.successCriteria = "Make success clear and measurable.";
  if (input.verificationMethod.trim().length < 5) errors.verificationMethod = "Explain how the Promise will be verified.";
  if (!Number.isInteger(input.amountMinor) || input.amountMinor < 500 || input.amountMinor > 100_000) errors.amountMinor = "Choose an amount from $5 to $1,000.";
  if (!supportedCurrencies.includes(input.currency)) errors.currency = "Choose a supported currency.";
  if ((input.message?.length ?? 0) > 280) errors.message = "Keep your message under 280 characters.";
  return errors;
}

export function assertValidCreateBack(input: CreateBackInput) {
  const errors = validateCreateBack(input);
  if (Object.keys(errors).length) throw new CreateBackValidationError(errors);
}

export class CreateBackValidationError extends Error {
  constructor(public readonly errors: ValidationErrors) { super("Invalid Back"); }
}
