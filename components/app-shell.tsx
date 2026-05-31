"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useEffect, useRef, useState, type PropsWithChildren } from "react";

import type { AppRole } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: string;
};

const roleNavItems: Record<AppRole, NavItem[]> = {
  attendee: [
  { href: "/app/schedule", label: "Schedule", mobileLabel: "Sched", icon: "\u25cb" },
  { href: "/app/my-schedule", label: "My Week", mobileLabel: "Week", icon: "\u25c6" },
  { href: "/app/map", label: "Map", mobileLabel: "Map", icon: "\u2316" },
  { href: "/app/community", label: "Community", mobileLabel: "Community", icon: "\u25ce" },
  { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "\u25cc" }
  ],
  sponsor: [
    { href: "/app/schedule", label: "Schedule", mobileLabel: "Sched", icon: "\u25cb" },
    { href: "/app/sponsor", label: "Sponsor", mobileLabel: "Sponsor", icon: "\u25c6" },
    { href: "/app/sponsor/reach", label: "Reach", mobileLabel: "Reach", icon: "\u2316" },
    { href: "/app/community", label: "Community", mobileLabel: "Community", icon: "\u25ce" },
    { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "\u25cc" }
  ],
  speaker: [
    { href: "/app/schedule", label: "Schedule", mobileLabel: "Sched", icon: "\u25cb" },
    { href: "/app/workspace", label: "Speaker Desk", mobileLabel: "Desk", icon: "\u25c6" },
    { href: "/app/my-schedule", label: "My Week", mobileLabel: "Week", icon: "\u2316" },
    { href: "/app/map", label: "Map", mobileLabel: "Map", icon: "\u25ce" },
    { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "\u25cc" }
  ],
  host: [
    { href: "/app/my-schedule", label: "My Week", mobileLabel: "Week", icon: "\u25cb" },
    { href: "/app/workspace", label: "Workspace", mobileLabel: "Work", icon: "\u25c6" },
    { href: "/app/map", label: "Map", mobileLabel: "Map", icon: "\u2316" },
    { href: "/app/volunteer", label: "Volunteer", mobileLabel: "Crew", icon: "\u25ce" },
    { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "\u25cc" }
  ],
  admin: [
    { href: "/app/schedule", label: "Schedule", mobileLabel: "Sched", icon: "\u25cb" },
    { href: "/app/admin", label: "Admin", mobileLabel: "Admin", icon: "\u25c6" },
    { href: "/app/workspace", label: "Workspace", mobileLabel: "Work", icon: "\u2316" },
    { href: "/app/submit", label: "Submit", mobileLabel: "Submit", icon: "\u25ce" },
    { href: "/app/profile", label: "Profile", mobileLabel: "Profile", icon: "\u25cc" }
  ]
};

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    auth,
    availableProfiles,
    clearPreviewProfile,
    currentUser,
    isPreviewing,
    previewProfileId,
    setPreviewProfile
  } = useAppState();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const pullTriggered = useRef(false);
  const navItems = roleNavItems[currentUser.appRole];

  useEffect(() => {
    if (pathname === "/app/updates") return;

    function handleTouchStart(event: TouchEvent) {
      if (window.scrollY > 0) return;
      touchStartY.current = event.touches[0]?.clientY ?? null;
      pullTriggered.current = false;
    }

    function handleTouchMove(event: TouchEvent) {
      if (touchStartY.current === null || window.scrollY > 0) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY.current;
      const distance = Math.max(0, currentY - touchStartY.current);
      setPullDistance(Math.min(distance, 110));

      if (distance > 84 && !pullTriggered.current) {
        pullTriggered.current = true;
        setPullDistance(0);
        router.push("/app/updates");
      }
    }

    function handleTouchEnd() {
      touchStartY.current = null;
      pullTriggered.current = false;
      setPullDistance(0);
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [pathname, router]);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1380px] flex-col bg-[radial-gradient(900px_360px_at_92%_0%,rgba(251,189,25,0.14),transparent_58%),linear-gradient(180deg,#0c495a_0%,#0e5365_28%,#f5f7f8_28%,#ffffff_100%)] px-0 pb-[calc(6.75rem+var(--safe-bottom))] pt-[var(--safe-top)]">
      <div className="relative z-20 mb-0">
        <div className="app-banner px-5 py-5 md:px-8 md:py-6">
          <div className="banner-top">
            <div className="flex items-center gap-3">
              <Image src="/tcsw-logo.png" alt="" width={180} height={56} className="h-7 w-auto object-contain" priority />
              <div className="banner-eyebrow">Eighth Annual</div>
            </div>
            <div className="banner-year">2026</div>
          </div>
          <div className="banner-lockup">
            <Link href="/" className="banner-title text-[36px] md:text-[42px]">
              TWIN CITIES<span className="accent text-[29px] md:text-[34px]">STARTUP WEEK</span>
            </Link>
          </div>
          <div className="banner-sub text-[12px] md:text-[13px]">
            <span className="pulse" />
            Sept 14-18 - Minneapolis - St. Paul
          </div>
          <div className="banner-beta">
            <span className="beta-mark">B</span>
            Produced by BETA.MN
          </div>
          <div className="powered">
            Powered by <span className="attn">Attentio</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-white/8 px-3 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/54">
                Demo identity
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {currentUser.name} - {currentUser.appRole}
              </p>
              <p className="text-[12px] text-white/64">
                {isPreviewing
                  ? `Previewing seeded account while auth stays ${auth.status}.`
                  : "Using live auth account path."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="preview-profile-switcher">
                Preview account
              </label>
              <select
                id="preview-profile-switcher"
                value={previewProfileId ?? ""}
                onChange={(event) => {
                  const nextProfileId = event.target.value || null;
                  setPreviewProfile(nextProfileId);

                  const profile = availableProfiles.find((entry) => entry.id === nextProfileId);
                  const nextHref =
                    profile?.appRole === "sponsor"
                      ? "/app/sponsor"
                      : profile?.appRole === "speaker"
                        ? "/app/workspace"
                      : profile?.appRole === "admin"
                        ? "/app/admin"
                        : profile?.appRole === "host"
                          ? "/app/workspace"
                          : "/app/schedule";
                  router.push(nextHref);
                }}
                className="min-w-[220px] appearance-none rounded-full border border-white/18 bg-[#0c495a] px-4 py-2 text-sm font-semibold text-white outline-none"
              >
                <option value="">Live account view</option>
                {availableProfiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} - {profile.appRole}
                  </option>
                ))}
              </select>
              {isPreviewing ? (
                <button
                  type="button"
                  onClick={clearPreviewProfile}
                  className="rounded-full border border-white/14 px-3 py-2 text-[12px] font-semibold text-white/84 transition hover:bg-white/8"
                >
                  Exit preview
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="section-seam" aria-hidden="true">
          <span className="section-seam__line" />
          <span className="section-seam__label">Build - Fund - Connect</span>
          <span className="section-seam__line" />
        </div>
      </div>

      <main className="content-stage relative z-0 flex-1">{children}</main>
      {pathname !== "/app/updates" ? (
        <div
          className="pointer-events-none fixed left-1/2 top-[calc(var(--safe-top)+0.35rem)] z-40 -translate-x-1/2 transition-all"
          style={{
            opacity: pullDistance > 8 ? 1 : 0,
            transform: `translate(-50%, ${Math.min(pullDistance * 0.45, 28)}px)`
          }}
        >
          <div className="rounded-full border border-white/10 bg-midnight/88 px-3 py-1.5 text-[11px] font-semibold text-white shadow-glow">
            {pullDistance > 64 ? "Release for updates" : "Pull for updates"}
          </div>
        </div>
      ) : null}

      <nav className="app-bottom-nav fixed bottom-[calc(1rem+var(--safe-bottom))] left-1/2 z-50 grid w-[min(calc(100vw-1rem-var(--safe-left)-var(--safe-right)),560px)] grid-cols-5 gap-1 -translate-x-1/2 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#0e5365_0%,#0c495a_100%)] px-2 py-2 text-white shadow-[0_18px_44px_rgba(12,73,90,0.28)] sm:px-3 sm:py-3">
        {navItems.map((item) => {
          const active =
            item.href === "/app/sponsor" ? pathname === item.href : pathname.startsWith(item.href);
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
                "flex min-w-0 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-center transition sm:px-2",
                active
                  ? "bg-midnight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_22px_rgba(12,73,90,0.2)]"
                  : "bg-[#f4f5fa] text-midnight shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] hover:bg-white"
              )}
            >
              <span
                className={clsx(
                  "grid h-4 place-items-center text-[11px] font-bold leading-none sm:h-5 sm:text-[12px]",
                  active ? "text-gold" : "text-[var(--color-muted)]"
                )}
              >
                {isPending ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current/25 border-t-current sm:h-4 sm:w-4" />
                ) : (
                  item.icon
                )}
              </span>
              <span className="max-w-full truncate text-[10px] font-extrabold leading-tight sm:hidden">
                {item.mobileLabel}
              </span>
              <span className="hidden max-w-full truncate text-[11px] font-extrabold leading-tight sm:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
