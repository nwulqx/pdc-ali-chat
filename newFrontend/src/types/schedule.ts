export type ScheduleType =
  | "system"
  | "activity"
  | "maintenance"
  | "reminder"
  | "promotion";
export type SchedulePriority = "high" | "medium" | "low";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  location?: string;
  type: ScheduleType;
  priority: SchedulePriority;
  image?: string;
}
