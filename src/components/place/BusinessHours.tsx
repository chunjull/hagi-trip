import { formatDailySchedule } from "@/components/place/place-display";
import type { DailySchedule } from "@/types";

interface BusinessHoursProps {
  label?: string;
  schedule: DailySchedule | undefined;
}

const BusinessHours = ({ label = "今日營業時間", schedule }: BusinessHoursProps) => {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-950">{formatDailySchedule(schedule)}</dd>
    </div>
  );
};

export default BusinessHours;
