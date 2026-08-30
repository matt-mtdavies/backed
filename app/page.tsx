import Link from "next/link";

export const metadata = { title: "BACKED — Belief made tangible", description: "Don’t just believe in someone. Back them." };

export default function Home() {
  return <main className="landing"><nav className="nav" aria-label="Primary navigation"><Link className="wordmark" href="/">BACKED<span>.</span></Link><Link className="navLink" href="/p/jason-first-half">See a promise</Link></nav><section className="hero"><p className="eyebrow">BELIEF, WITH WEIGHT.</p><h1>WHO DO YOU<br />BELIEVE IN?</h1><p className="heroCopy">Someone in your life has been talking about doing something. <strong>Put something behind them.</strong></p><div className="actions"><Link className="button primary" href="/back">BACK SOMEONE <span aria-hidden="true">↗</span></Link><Link className="button secondary" href="/back?mode=promise">MAKE A PROMISE</Link></div></section><section className="moneyMoment" aria-label="Example backing amount"><div className="moneyCard"><p>MATTHEW, MUM, DAD + 2 MORE</p><strong>$1,100</strong><span>behind Jason.</span><div className="progress"><i /></div><small>68% TO HIS FIRST HALF MARATHON</small></div></section></main>;
}
