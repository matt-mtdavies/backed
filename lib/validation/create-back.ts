import { promiseTemplates, type CreateBackInput } from "@/lib/backs/model";
import { emailPattern, phonePattern, validateBackerName, validateAmountMinor, validateCurrency, validateMessage } from "./shared";

export type ValidationErrors = Partial<Record<keyof CreateBackInput, string>>;
export { emailPattern, phonePattern };

export function validateCreateBack(input: CreateBackInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const backerNameError = validateBackerName(input.backerName);
  if (backerNameError) errors.backerName = backerNameError;
  if (input.achieverFirstName.trim().length < 2) errors.achieverFirstName = "Enter their first name.";
  if (!emailPattern.test(input.achieverContact) && !phonePattern.test(input.achieverContact)) errors.achieverContact = "Enter a valid email or mobile number.";
  if (!promiseTemplates.some((item) => item.key === input.templateKey)) errors.templateKey = "Choose a Promise.";
  if (input.promiseTitle.trim().length < 5) errors.promiseTitle = "Describe what you believe they can do.";
  else if (input.promiseTitle.trim().length > 100) errors.promiseTitle = "Keep the title under 100 characters.";
  if (!input.deadline || new Date(`${input.deadline}T23:59:59Z`) <= new Date()) errors.deadline = "Choose a future deadline.";
  if (input.successCriteria.trim().length < 10) errors.successCriteria = "Make success clear and measurable.";
  else if (input.successCriteria.trim().length > 400) errors.successCriteria = "Keep success criteria under 400 characters.";
  if (input.verificationMethod.trim().length < 5) errors.verificationMethod = "Explain how the Promise will be verified.";
  else if (input.verificationMethod.trim().length > 200) errors.verificationMethod = "Keep verification under 200 characters.";
  const amountError = validateAmountMinor(input.amountMinor);
  if (amountError) errors.amountMinor = amountError;
  const currencyError = validateCurrency(input.currency);
  if (currencyError) errors.currency = currencyError;
  const messageError = validateMessage(input.message);
  if (messageError) errors.message = messageError;
  return errors;
}

export function assertValidCreateBack(input: CreateBackInput) {
  const errors = validateCreateBack(input);
  if (Object.keys(errors).length) throw new CreateBackValidationError(errors);
}

export class CreateBackValidationError extends Error {
  constructor(public readonly errors: ValidationErrors) { super("Invalid Back"); }
}
