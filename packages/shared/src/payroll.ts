import type { Pence } from "./money";

/**
 * Indicative deductions for one semi-monthly pay period (24 a year).
 * The payroll provider's figures are always the record for HMRC; these are
 * for previews and reports only.
 */
export function estimateDeductions(gross: Pence, opts: { taxCode?: string; studentLoan?: "plan2" | null } = {}) {
  const periods = 24;
  const allowance = Math.round(1_257_000 / periods);
  const tax = opts.taxCode === "BR" ? Math.round(gross * 0.2) : Math.max(0, Math.round((gross - allowance) * 0.2));
  const ni = Math.max(0, Math.round((gross - allowance) * 0.08));
  const loan = opts.studentLoan === "plan2" ? Math.max(0, Math.floor(((gross - Math.round(2_847_000 / periods)) * 0.09) / 100) * 100) : 0;
  const employerNi = Math.max(0, Math.round((gross - Math.round(500_000 / periods)) * 0.15));
  return { tax, ni, loan, net: gross - tax - ni - loan, employerNi };
}

export type ReportPeriod = "week" | "month" | "year";

/** Inclusive date range for a report. `anchor` is any date inside the period. */
export function reportRange(period: ReportPeriod, anchor: Date): { from: Date; to: Date } {
  const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));
  if (period === "week") {
    const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
    const from = new Date(d.getTime() - dow * 86_400_000);
    return { from, to: new Date(from.getTime() + 6 * 86_400_000) };
  }
  if (period === "month") {
    return { from: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)), to: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)) };
  }
  // UK tax year: 6 April to 5 April
  const y = d.getUTCMonth() > 3 || (d.getUTCMonth() === 3 && d.getUTCDate() >= 6) ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return { from: new Date(Date.UTC(y, 3, 6)), to: new Date(Date.UTC(y + 1, 3, 5)) };
}
