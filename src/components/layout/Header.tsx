import Link from "next/link";
import { PawPrint } from "lucide-react";

const Header = () => (
  <header className="sticky top-0 z-1000 shrink-0 border-b-2 border-brand bg-paper">
    <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link className="flex min-w-0 items-center gap-3 rounded-lg py-2 text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/">
        <span aria-hidden="true" className="brand-stamp"><PawPrint className="size-6" strokeWidth={2} /></span>
        <span className="min-w-0">
          <span className="block text-base font-bold tracking-[0.12em]">村塾組的狗</span>
          <span className="mt-0.5 block text-[0.6875rem] font-medium tracking-wide text-ink-muted">銀魂 × 萩市｜巡禮資訊</span>
        </span>
      </Link>

      <nav aria-label="主要導覽" className="hidden sm:block">
        <ul className="flex items-center gap-1 text-sm font-semibold text-brand">
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-brand-wash focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/">
              景點地圖
            </Link>
          </li>
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-brand-wash focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/list">
              日期清單
            </Link>
          </li>
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-md px-3 hover:bg-brand-wash focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand" href="/about">
              關於本站
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

export default Header;
