"use client";
import { useEffect, useMemo, useRef, useState } from "react";

const weekdays=["S","M","T","W","T","F","S"];
const iso=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const parse=(value:string)=>{if(!value)return null;const [year,month,day]=value.split("-").map(Number);return new Date(year,month-1,day)};

export function BrandedDatePicker({value,onChange}:{value:string;onChange:(value:string)=>void}){
  const selected=parse(value);const today=new Date();today.setHours(0,0,0,0);
  const [open,setOpen]=useState(false);const [cursor,setCursor]=useState(()=>selected??new Date(today.getFullYear(),today.getMonth(),1));
  const triggerRef=useRef<HTMLButtonElement>(null);
  const close=()=>{setOpen(false);triggerRef.current?.focus()};
  useEffect(()=>{
    if(!open)return;
    const onKeyDown=(event:KeyboardEvent)=>{if(event.key==="Escape")close()};
    document.addEventListener("keydown",onKeyDown);
    return ()=>document.removeEventListener("keydown",onKeyDown);
  },[open]);
  const days=useMemo(()=>{const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);const start=new Date(first);start.setDate(1-first.getDay());return Array.from({length:42},(_,index)=>{const day=new Date(start);day.setDate(start.getDate()+index);return day})},[cursor]);
  const label=selected?.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})??"Choose a date";
  return <div className="datePicker"><button ref={triggerRef} type="button" className="dateTrigger" aria-expanded={open} onClick={()=>setOpen(value=>!value)}><span>{label}</span><i aria-hidden="true"/></button>{open&&<div className="calendar" role="dialog" aria-label="Choose a deadline"><header><button type="button" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))} aria-label="Previous month">←</button><strong>{cursor.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</strong><button type="button" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))} aria-label="Next month">→</button></header><div className="weekdays" aria-hidden="true">{weekdays.map((day,index)=><span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendarGrid">{days.map(day=>{const outside=day.getMonth()!==cursor.getMonth();const disabled=day<today;const active=value===iso(day);return <button type="button" key={iso(day)} disabled={disabled} className={`${outside?"outside ":""}${active?"active":""}`} aria-label={day.toLocaleDateString("en-US",{dateStyle:"long"})} aria-pressed={active} onClick={()=>{onChange(iso(day));close()}}>{day.getDate()}</button>})}</div><footer><button type="button" onClick={()=>{setCursor(new Date(today.getFullYear(),today.getMonth(),1));onChange(iso(today));close()}}>TODAY</button><button type="button" onClick={close}>CLOSE</button></footer></div>}</div>
}
