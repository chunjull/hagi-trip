"use client";

import { useSiteTime } from "@/components/event/use-site-time";

const ArchiveNotice = () => {
  const { mode } = useSiteTime();

  if (mode?.type !== "archive") return null;

  return (
    <p className="shrink-0 border-b border-brand-line bg-brand-wash px-4 py-2 text-center text-sm font-semibold text-brand-dark" role="status">
      紀念模式：活動已結束，目前呈現活動期間的資料。
    </p>
  );
};

export default ArchiveNotice;
