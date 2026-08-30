export const supportedCurrencies=["USD","CAD","GBP","EUR"] as const;
export type SupportedCurrency=(typeof supportedCurrencies)[number];
const localeDefaults:Record<string,SupportedCurrency>={CA:"CAD",GB:"GBP",IE:"EUR",FR:"EUR",DE:"EUR",ES:"EUR",IT:"EUR",NL:"EUR",PT:"EUR",AT:"EUR",BE:"EUR"};

export function resolveCurrency(profileCurrency?:string|null,locale="en-US"):SupportedCurrency{
  if(profileCurrency&&supportedCurrencies.includes(profileCurrency as SupportedCurrency))return profileCurrency as SupportedCurrency;
  const region=locale.split("-")[1]?.toUpperCase();
  return (region&&localeDefaults[region])||"USD";
}

export function currencySymbol(currency:SupportedCurrency){return new Intl.NumberFormat("en",{style:"currency",currency,currencyDisplay:"narrowSymbol",maximumFractionDigits:0}).formatToParts(0).find(part=>part.type==="currency")?.value??currency}
