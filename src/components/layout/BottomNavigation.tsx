"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, CircleHelp, MapPinned } from "lucide-react";

interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { href: "/", label: "地圖", icon: MapPinned },
  { href: "/list", label: "日期清單", icon: CalendarDays },
  { href: "/about", label: "關於", icon: CircleHelp },
];

const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="行動版主要導覽"
      className="fixed inset-x-0 bottom-0 z-1000 border-t border-brand-line bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgb(0_69_147_/_0.08)] backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-3">
        {NAVIGATION_ITEMS.map((item) => {
          const isCurrent = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-semibold focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-brand ${
                  isCurrent ? "bg-brand text-white" : "text-brand hover:bg-brand-wash"
                }`}
                href={item.href}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavigation;
