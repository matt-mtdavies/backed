import Link from "next/link"; import { BackingSheet } from "@/components/backing/BackingSheet";
export default function BackPage(){return <main className="sheetPage"><Link href="/p/jason-first-half" className="closeLink" aria-label="Back to promise">← BACK</Link><BackingSheet name="Jason"/></main>}
