import Link from "next/link"; import { BackedLogo } from "@/components/brand/BackedLogo";
export function SiteNav(){ return <nav className="nav" aria-label="Primary navigation"><BackedLogo/><Link className="navLink" href="/p/jason-first-half">See a promise</Link></nav>; }
