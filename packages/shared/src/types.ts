export type Surface = "customer" | "business" | "pro" | "admin";

export type BusinessRole = "owner" | "manager" | "supervisor" | "office";
export type AdminRole = "super" | "operations" | "support" | "finance";

export type ServiceKey = "regular" | "deep" | "eot";
export type Frequency = "once" | "weekly" | "fortnightly" | "monthly";
export type Condition = "well" | "average" | "extra" | "heavy";
export type PhotoPermission = "allowed" | "none";

export type VisitState =
  | "scheduled"
  | "in_progress"
  | "submitted"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled";

export type TaskResult = "done" | "not_done" | "na";
export type PhotoKind = "before" | "after";

export type ProAppStatus = "invited" | "active" | "removed";
export type VerificationItem = "photo_id" | "right_to_work" | "dbs" | "bank";
export type VerificationStatus = "missing" | "submitted" | "verified" | "rejected";

export type DisputeStatus = "open" | "awaiting_business" | "awaiting_customer" | "resolved";
export type CampaignChannel = "email" | "sms" | "ads" | "reviews";
export type CampaignStatus = "draft" | "scheduled" | "sent" | "running" | "stopped" | "cancelled";

export interface TaskSelectionInput {
  service: ServiceKey;
  /** keys of catalogue tasks the customer unticked */
  removed: string[];
  /** customer's own tasks */
  custom: { room: string; name: string }[];
}
