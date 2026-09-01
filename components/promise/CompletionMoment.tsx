import { currencySymbol, type SupportedCurrency } from "@/lib/money/currency";

type CompletionBacker = { name: string; amountMinor: number };

// Composition bands mirror the Wall of Belief's own (Master Spec §9.2):
// small groups stand large and close, bigger crowds pack tighter and recede
// further, but every real Backer gets a circle — there is no synthetic
// minimum crowd size the way a design exploration might use for preview.
function compositionBand(count: number) {
  if (count > 9) return { maxD: "clamp(58px, 11vw, 116px)", overlap: 0.46 };
  if (count > 6) return { maxD: "clamp(66px, 12.5vw, 138px)", overlap: 0.4 };
  return { maxD: "clamp(76px, 15vw, 168px)", overlap: 0.34 };
}

export function CompletionMoment({
  achieverName,
  title,
  totalAmountMinor,
  currency,
  backers,
  allBackingReleased,
}: {
  achieverName: string;
  title: string;
  totalAmountMinor: number;
  currency: SupportedCurrency;
  backers: readonly CompletionBacker[];
  allBackingReleased: boolean;
}) {
  const symbol = currencySymbol(currency);
  const n = backers.length;
  const mid = (n - 1) / 2;
  const band = compositionBand(n);

  return (
    <section className="completionMoment" style={{ "--maxD": band.maxD, "--overlapFactor": band.overlap } as React.CSSProperties}>
      {n > 0 && (
        <>
          <div className="completionCrowd">
            {backers.map((backer, index) => {
              const d = mid === 0 ? 0 : Math.abs(index - mid) / mid;
              return (
                <div
                  key={`${backer.name}-${index}`}
                  className="completionPerson rise"
                  style={{
                    "--scale": 0.78 + 0.22 * d,
                    "--topFactor": 1 - d,
                    "--mlMult": index === 0 ? 0 : 1,
                    "--z": Math.round(d * 10) + 1,
                    "--bg": d > 0.66 ? "#d7d8cf" : d > 0.33 ? "#8e948e" : "#848a84",
                    "--delay": `${Math.round((0.08 + (1 - d) * 0.22) * 100) / 100}s`,
                  } as React.CSSProperties}
                >
                  <div className="completionCircle"><b>{backer.name.charAt(0).toUpperCase()}</b></div>
                  <span>{backer.name.toUpperCase()}</span>
                </div>
              );
            })}
          </div>
          <div className="completionScrim" />
        </>
      )}
      <div className="completionContent">
        <p className="eyebrow">{title.toUpperCase()}</p>
        <h1 className="rise">YOU DID IT<span className="completionSignal rise">.</span></h1>
        <p className="completionSub rise">Promise kept.</p>
        <strong className="completionMoney rise">{symbol}{(totalAmountMinor / 100).toLocaleString()}</strong>
        <span className="completionMoneyLabel rise">{allBackingReleased ? "Backing released." : "Backing releasing."}</span>
        {n > 0 && (
          <div className="completionRoll rise">
            {backers.map((backer) => (
              <div key={backer.name} className="completionRollItem">
                <span>{backer.name.toUpperCase()}</span>
                <b>{symbol}{(backer.amountMinor / 100).toLocaleString()}</b>
              </div>
            ))}
          </div>
        )}
        <p className="completionShareHint rise">{achieverName}, share what happened.</p>
      </div>
    </section>
  );
}
