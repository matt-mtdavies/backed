import type { AddBackingInput } from "@/lib/backs/model";
import { validateBackerName, validateAmountMinor, validateCurrency, validateMessage } from "./shared";

export type ValidationErrors = Partial<Record<keyof AddBackingInput, string>>;

export function validateAddBacking(input: AddBackingInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const backerNameError = validateBackerName(input.backerName);
  if (backerNameError) errors.backerName = backerNameError;
  const amountError = validateAmountMinor(input.amountMinor);
  if (amountError) errors.amountMinor = amountError;
  const currencyError = validateCurrency(input.currency);
  if (currencyError) errors.currency = currencyError;
  const messageError = validateMessage(input.message);
  if (messageError) errors.message = messageError;
  return errors;
}

export function assertValidAddBacking(input: AddBackingInput) {
  const errors = validateAddBacking(input);
  if (Object.keys(errors).length) throw new AddBackingValidationError(errors);
}

export class AddBackingValidationError extends Error {
  constructor(public readonly errors: ValidationErrors) { super("Invalid Backing"); }
}
