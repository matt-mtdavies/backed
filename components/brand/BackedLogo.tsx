import Link from "next/link";
import { BackedMark } from "./BackedMark";
export function BackedLogo(){ return <Link className="wordmark" href="/" aria-label="BACKED home"><span className="brandMark"><BackedMark/></span><b>BACKED</b><em>.</em></Link>; }
