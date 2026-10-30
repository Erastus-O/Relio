/** All money is stored and passed around as integer pence. */
export type Pence = number;

export function formatGBP(p: Pence): string {
  const sign = p < 0 ? "-" : "";
  const abs = Math.abs(p);
  return `${sign}£${(abs / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function percentOf(amount: Pence, pct: number): Pence {
  return Math.round((amount * pct) / 100);
}
