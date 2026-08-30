"use client";
import { currencySymbol, type SupportedCurrency } from "@/lib/money/currency";

export function MoneyInput({value,currency,onChange}:{value:number;currency:SupportedCurrency;onChange:(value:number)=>void}){
  const set=(next:number)=>onChange(Math.max(5,Math.min(1000,Math.round(next||0))));
  return <div className="moneyInput"><span aria-hidden="true">{currencySymbol(currency)}</span><input aria-label={`Other amount in ${currency}`} inputMode="numeric" pattern="[0-9]*" value={value} onChange={event=>set(Number(event.target.value.replace(/\D/g,"")))} /><small>{currency}</small><div><button type="button" aria-label="Decrease amount" onClick={()=>set(value-5)}>−</button><button type="button" aria-label="Increase amount" onClick={()=>set(value+5)}>+</button></div></div>
}
