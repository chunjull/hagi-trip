import { formatDailySchedule } from "@/components/place/place-display";
import type { DailySchedule } from "@/types";

interface BusinessHoursProps {
  label?: string;
  schedule: DailySchedule | undefined;
}

const BusinessHours = ({ label = "今日營業時間", schedule }: BusinessHoursProps) => {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{formatDailySchedule(schedule)}</dd>
    </div>
  );
};

export default BusinessHours;
