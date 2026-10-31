"use client";
import { BizShell } from "@/components/BizShell";
import { VisitEvidence } from "@/components/VisitEvidence";

export default function Page({ params }: { params: { id: string } }) {
  return <BizShell>{(bid) => <VisitEvidence bid={bid} id={params.id} />}</BizShell>;
}
