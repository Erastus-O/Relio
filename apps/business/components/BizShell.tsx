"use client";
import Link from "next/link";
import { type Me, Shell, currentBusiness } from "@relio/web-ui";

export const BIZ_LINKS: [string, string][] = [
  ["/", "Overview"], ["/quality", "Quality"], ["/pros", "Pros and documents"],
  ["/payroll", "Payroll reports"], ["/campaigns", "Campaigns"],
];

export function BizShell({ children }: { children: (businessId: string, me: Me) => React.ReactNode }) {
  return (
    <Shell area="Business" links={BIZ_LINKS} need={(me) => me.businesses.length > 0} denied={<p>You’re not part of a business yet. <Link href="/signup">Set up your business</Link>.</p>}>
      {(me) => children(currentBusiness(me)!.id, me)}
    </Shell>
  );
}
