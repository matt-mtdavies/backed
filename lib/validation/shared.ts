import { supportedCurrencies, type SupportedCurrency } from "@/lib/money/currency";

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phonePattern = /^\+?[\d\s().-]{8,}$/;

export function validateBackerName(value: string): string | undefined {
  if (value.trim().length < 2) return "Enter your name.";
}

export function validateAmountMinor(value: number): string | undefined {
  if (!Number.isInteger(value) || value < 500 || value > 100_000) return "Choose an amount from $5 to $1,000.";
}

export function validateCurrency(value: SupportedCurrency): string | undefined {
  if (!supportedCurrencies.includes(value)) return "Choose a supported currency.";
}

export function validateMessage(value: string | undefined): string | undefined {
  if ((value?.length ?? 0) > 280) return "Keep your message under 280 characters.";
}
