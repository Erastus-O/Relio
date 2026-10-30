"use client";
import type { Me } from "@/lib/api";
import { Shell, currentBusiness } from "./Shell";

export const BIZ_LINKS: [string, string][] = [
  ["/business", "Overview"], ["/business/quality", "Quality"], ["/business/pros", "Pros and documents"],
  ["/business/payroll", "Payroll reports"], ["/business/campaigns", "Campaigns"],
];

export function BizShell({ children }: { children: (businessId: string, me: Me) => React.ReactNode }) {
  return (
    <Shell links={BIZ_LINKS} need={(me) => me.businesses.length > 0}>
      {(me) => children(currentBusiness(me)!.id, me)}
    </Shell>
  );
}
