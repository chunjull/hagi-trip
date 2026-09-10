"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAVIGATION_ITEMS = [
  { href: "/", label: "地圖", symbol: "◎" },
  { href: "/list", label: "日期清單", symbol: "▤" },
  { href: "/about", label: "關於", symbol: "ⓘ" },
] as const;

const BottomNavigation = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="行動版主要導覽"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-slate-300 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgb(15_23_42_/_0.12)] backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-3">
        {NAVIGATION_ITEMS.map((item) => {
          const isCurrent = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-semibold focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-sky-700 ${
                  isCurrent ? "bg-sky-50 text-sky-950" : "text-slate-600 hover:bg-slate-50"
                }`}
                href={item.href}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {item.symbol}
                </span>
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
