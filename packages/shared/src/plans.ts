import type { Pence } from "./money";

export type PlanKey = "starter" | "growth" | "team" | "enterprise";

export type FeatureKey =
  | "marketplace_profile"
  | "booking_page"
  | "task_checklists"
  | "customer_before_photos"
  | "all_pricing_models"
  | "recurring_and_quotes"
  | "pro_app"
  | "rota"
  | "pro_verification"
  | "document_expiry"
  | "training"
  | "pro_wallet"
  | "task_photos"
  | "checkin"
  | "quality_review"
  | "concerns"
  | "card_payments"
  | "invoices"
  | "finance"
  | "payroll"
  | "payroll_reports"
  | "offers"
  | "campaigns"
  | "campaign_integrations"
  | "review_requests"
  | "demand_map_full"
  | "analytics_full"
  | "ai_assistant"
  | "multi_location"
  | "sso";

export interface Plan {
  key: PlanKey;
  name: string;
  monthly: Pence | null; // null = custom
  yearly: Pence | null;
  prosIncluded: number | null; // null = unlimited
  extraProMonthly: Pence | null;
  /** Fee in basis points on marketplace bookings (600 = 6%). */
  marketplaceFeeBps: number | null;
  /** Starter: fee on every marketplace booking. Paid plans: only a new customer's first one. */
  feeOnRepeatBookings: boolean;
  servicesLimit: number | null;
  activeOffersLimit: number | null;
  campaignEmailsPerMonth: number | null;
  aiQuestionsPerMonth: number | null;
  activityLogDays: number | null;
  features: FeatureKey[];
}

const starterFeatures: FeatureKey[] = [
  "marketplace_profile", "booking_page", "task_checklists", "customer_before_photos", "pro_app",
  "task_photos", "checkin", "concerns", "card_payments", "offers",
];
const growthFeatures: FeatureKey[] = [
  ...starterFeatures, "all_pricing_models", "recurring_and_quotes", "rota", "pro_verification", "document_expiry",
  "quality_review", "invoices", "finance", "campaigns", "review_requests", "demand_map_full", "analytics_full", "ai_assistant",
];
const teamFeatures: FeatureKey[] = [...growthFeatures, "training", "pro_wallet", "payroll", "payroll_reports", "campaign_integrations"];

export const PLANS: Record<PlanKey, Plan> = {
  starter: { key: "starter", name: "Starter", monthly: 0, yearly: 0, prosIncluded: 1, extraProMonthly: null, marketplaceFeeBps: 600, feeOnRepeatBookings: true, servicesLimit: 3, activeOffersLimit: 1, campaignEmailsPerMonth: 0, aiQuestionsPerMonth: 0, activityLogDays: 30, features: starterFeatures },
  growth: { key: "growth", name: "Growth", monthly: 2900, yearly: 29000, prosIncluded: 5, extraProMonthly: 500, marketplaceFeeBps: 400, feeOnRepeatBookings: false, servicesLimit: null, activeOffersLimit: null, campaignEmailsPerMonth: 1000, aiQuestionsPerMonth: 50, activityLogDays: 365, features: growthFeatures },
  team: { key: "team", name: "Team", monthly: 7900, yearly: 79000, prosIncluded: 15, extraProMonthly: 400, marketplaceFeeBps: 250, feeOnRepeatBookings: false, servicesLimit: null, activeOffersLimit: null, campaignEmailsPerMonth: 5000, aiQuestionsPerMonth: null, activityLogDays: 365 * 3, features: teamFeatures },
  enterprise: { key: "enterprise", name: "Enterprise", monthly: null, yearly: null, prosIncluded: null, extraProMonthly: null, marketplaceFeeBps: null, feeOnRepeatBookings: false, servicesLimit: null, activeOffersLimit: null, campaignEmailsPerMonth: null, aiQuestionsPerMonth: null, activityLogDays: null, features: [...teamFeatures, "multi_location", "sso"] },
};

export function hasFeature(plan: PlanKey, f: FeatureKey): boolean {
  return PLANS[plan].features.includes(f);
}

/** Platform fee on a marketplace booking, in pence. Bookings from the business's own customers are always 0. */
export function marketplaceFee(plan: PlanKey, amount: Pence, opts: { fromMarketplace: boolean; customerBookedBefore: boolean; customBps?: number }): Pence {
  if (!opts.fromMarketplace) return 0;
  const p = PLANS[plan];
  if (opts.customerBookedBefore && !p.feeOnRepeatBookings) return 0;
  const bps = p.marketplaceFeeBps ?? opts.customBps ?? 0;
  return Math.round((amount * bps) / 10000);
}

/** Monthly subscription cost for a number of active pros. */
export function monthlyCost(plan: PlanKey, activePros: number, billing: "monthly" | "yearly" = "monthly"): Pence | null {
  const p = PLANS[plan];
  if (p.monthly === null) return null;
  const base = billing === "yearly" && p.yearly !== null ? Math.round(p.yearly / 12) : p.monthly;
  const extra = p.prosIncluded !== null && p.extraProMonthly ? Math.max(0, activePros - p.prosIncluded) * p.extraProMonthly : 0;
  return base + extra;
}
