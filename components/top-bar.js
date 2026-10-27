"use client";

import { usePathname } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

const PAGES = [
  { href: "/", label: "URL 줄이기" },
  { href: "/admin", label: "관리자 통계" },
];

// /admin 은 Basic 인증 창이 떠야 해서 미리 불러오는 Link 대신 일반 링크로 이동한다
export default function TopBar() {
  const pathname = usePathname();
  const current = PAGES.find((page) => page.href === pathname);

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="crumbs">
          <a href="/" className="crumbs-app">
            URL Shortener
          </a>
          {current && (
            <>
              <CaretRight size={12} weight="bold" aria-hidden="true" />
              <span className="crumbs-current">{current.label}</span>
            </>
          )}
        </div>

        <nav className="top-nav" aria-label="화면 이동">
          {PAGES.map((page) => (
            <a
              key={page.href}
              href={page.href}
              aria-current={page.href === pathname ? "page" : undefined}
            >
              {page.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
