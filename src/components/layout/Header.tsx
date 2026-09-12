import Link from "next/link";

const Header = () => (
  <header className="border-b border-slate-200 bg-white">
    <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <Link className="rounded-lg py-2 font-semibold tracking-tight text-slate-950 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700" href="/">
        <span lang="ja">村塾組的狗</span>
        <span className="ml-2 text-xs font-medium text-slate-500">銀魂 × 萩市｜巡禮資訊</span>
      </Link>

      <nav aria-label="主要導覽" className="hidden sm:block">
        <ul className="flex items-center gap-1 text-sm font-semibold text-slate-700">
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700" href="/">
              景點地圖
            </Link>
          </li>
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700" href="/list">
              日期清單
            </Link>
          </li>
          <li>
            <Link className="inline-flex min-h-11 items-center rounded-lg px-3 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-700" href="/about">
              關於本站
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
);

export default Header;
