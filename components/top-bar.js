"use client";

import { usePathname } from "next/navigation";
import { CaretRight } from "@phosphor-icons/react";

// 관리자 통계는 공개 메뉴에 두지 않고 /admin 주소로만 들어간다
export default function TopBar() {
  const isAdmin = usePathname() === "/admin";

  return (
    <header className="top-bar">
      <div className={isAdmin ? "top-bar-inner" : "top-bar-inner is-narrow"}>
        <div className="crumbs">
          <a href="/" className="crumbs-app">
            URL Shortener
          </a>
          {isAdmin && (
            <>
              <CaretRight size={12} weight="bold" aria-hidden="true" />
              <span className="crumbs-current">관리자 통계</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
