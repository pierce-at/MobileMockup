"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useState, type PropsWithChildren } from "react";

import { InterestOnboarding } from "@/components/interest-onboarding";

const navItems = [
  { href: "/app/schedule", label: "Schedule", mobileLabel: "Sched", icon: "○" },
  { href: "/app/my-schedule", label: "My Week", mobileLabel: "Week", icon: "◆" },
  { href: "/app/map", label: "Map", mobileLabel: "Map", icon: "⌖" },
  { href: "/app/community", label: "Community", mobileLabel: "Community", icon: "◎" },
  { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "◌" }
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1380px] flex-col bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.16),transparent_25%),linear-gradient(180deg,#08142f_0%,#091834_28%,#f6f3ea_28%,#f8f6ef_100%)] px-0 pb-[calc(6.75rem+var(--safe-bottom))] pt-[var(--safe-top)]">
      <div className="relative z-20 mb-0">
        <div className="app-banner px-5 py-5 md:px-8 md:py-6">
          <div className="banner-top">
            <div className="banner-eyebrow">Eighth Annual</div>
            <div className="banner-year">2026</div>
          </div>
          <div className="banner-lockup">
            <Link href="/" className="banner-title text-[36px] md:text-[42px]">
              TWIN CITIES<span className="accent text-[29px] md:text-[34px]">STARTUP WEEK</span>
            </Link>
          </div>
          <div className="banner-sub text-[12px] md:text-[13px]">
            <span className="pulse" />
            Sept 14-18 · Minneapolis - St. Paul
          </div>
          <div className="banner-beta">
            <span className="beta-mark">β</span>
            Produced by BETA.MN
          </div>
          <div className="powered">
            Powered by <span className="attn">Attentio</span>
          </div>
        </div>

        <div className="section-seam" aria-hidden="true">
          <span className="section-seam__line" />
          <span className="section-seam__label">Build · Fund · Connect</span>
          <span className="section-seam__line" />
        </div>
      </div>

      <main className="content-stage relative z-0 flex-1">{children}</main>
      <InterestOnboarding />

      <nav className="fixed bottom-[calc(1rem+var(--safe-bottom))] left-1/2 z-50 grid w-[min(calc(100vw-1rem-var(--safe-left)-var(--safe-right)),560px)] grid-cols-5 gap-1 -translate-x-1/2 rounded-[28px] border border-white/10 bg-midnight/96 px-2 py-2 text-white shadow-glow backdrop-blur sm:px-3 sm:py-3">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const isPending = pendingHref === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (!active) {
                  setPendingHref(item.href);
                }
              }}
              className={clsx(
                "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold tracking-[0.01em] transition sm:px-2 sm:text-[11px]",
                active
                  ? "bg-white/10 text-gold"
                  : "text-indigo hover:bg-white/6 hover:text-white"
              )}
            >
              <span className="grid h-4 place-items-center text-sm sm:h-5 sm:text-base">
                {isPending ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current/25 border-t-current sm:h-4 sm:w-4" />
                ) : (
                  item.icon
                )}
              </span>
              <span className="max-w-full truncate leading-tight sm:hidden">{item.mobileLabel}</span>
              <span className="hidden max-w-full truncate leading-tight sm:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
