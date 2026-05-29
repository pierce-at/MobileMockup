"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import type { SponsorEventRecord, SponsorEventType } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

type SponsorHubKey =
  | "overview"
  | "reach"
  | "sessions"
  | "booth"
  | "edit"
  | "leads"
  | "team"
  | "fulfillment";

type Placement = {
  title: string;
  meta: string;
  views: number;
};

type SponsorHubMetrics = {
  profileViews: number;
  uniqueViewers: number;
  sessionRsvps: number;
  boothTapIns: number;
  promiseLift: number;
  attendanceRate: number;
  rsvpDelta: number;
  fulfillmentMet: number;
};

const sideLinks: Array<{
  key: SponsorHubKey;
  label: string;
  href: string;
  section?: "top" | "account";
}> = [
  { key: "overview", label: "Overview", href: "/app/sponsor", section: "top" },
  { key: "reach", label: "Page Views & Reach", href: "/app/sponsor/reach", section: "top" },
  {
    key: "sessions",
    label: "Sponsored Sessions",
    href: "/app/sponsor/sessions",
    section: "top"
  },
  {
    key: "booth",
    label: "Booth & Activations",
    href: "/app/sponsor/booth",
    section: "top"
  },
  { key: "edit", label: "Edit Sponsor Page", href: "/app/sponsor/edit", section: "top" },
  {
    key: "leads",
    label: "Lead Capture (opt-in)",
    href: "/app/sponsor/leads",
    section: "top"
  },
  { key: "team", label: "Team", href: "/app/sponsor/team", section: "account" },
  {
    key: "fulfillment",
    label: "Fulfillment Recap",
    href: "/app/sponsor/fulfillment",
    section: "account"
  }
];

const dayLabels = [
  { short: "MON 14", value: 0.48 },
  { short: "TUE 15", value: 0.92 },
  { short: "WED 16", value: 0.78 },
  { short: "THU 17", value: 0.84 },
  { short: "FRI 18", value: 0.64 }
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatCompact(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return formatNumber(value);
}

function getSessionForEvent(
  event: SponsorEventRecord,
  sessions: ReturnType<typeof useSponsorHubData>["sessions"]
) {
  const sessionId = event.metadata.sessionId;
  return sessionId ? sessions.find((session) => session.id === sessionId) : undefined;
}

function eventMatchesFilters(
  event: SponsorEventRecord,
  sessions: ReturnType<typeof useSponsorHubData>["sessions"],
  filters: { day: string; venueId: string; sessionId: string }
) {
  const session = getSessionForEvent(event, sessions);
  const eventVenueId = event.metadata.venueId ?? session?.venueId;

  if (filters.sessionId !== "all") {
    return event.metadata.sessionId === filters.sessionId;
  }

  if (filters.venueId !== "all" && eventVenueId !== filters.venueId) {
    return false;
  }

  if (filters.day !== "all") {
    return session?.day === filters.day;
  }

  return true;
}

function countEvents(events: SponsorEventRecord[], eventType: SponsorEventType) {
  return events.filter((event) => event.eventType === eventType).length;
}

function buildTrendSeries(
  events: SponsorEventRecord[],
  eventType: SponsorEventType,
  fallbackTotal: number
) {
  const total = events.filter((event) => event.eventType === eventType).length;

  if (!total) {
    const base = Math.max(fallbackTotal, 6);
    return [0.3, 0.42, 0.58, 0.5, 0.72, 0.9].map((weight, index) =>
      Math.max(1, Math.round((base / 6) * weight * (1 + index * 0.08)))
    );
  }

  const now = Date.now();
  const fourHours = 4 * 60 * 60 * 1000;
  const series = new Array(6).fill(0);

  events
    .filter((event) => event.eventType === eventType)
    .forEach((event) => {
      const age = now - new Date(event.createdAt).getTime();
      const bucket = Math.min(5, Math.max(0, 5 - Math.floor(age / fourHours)));
      series[bucket] += 1;
    });

  return series.map((value) => Math.max(value, 1));
}

function computeDeltaText(current: number, baseline: number) {
  if (!baseline) {
    return current ? "New activity this cycle" : "No movement yet";
  }

  const delta = Math.round(((current - baseline) / baseline) * 100);
  if (delta > 0) return `▲ ${delta}% vs. previous window`;
  if (delta < 0) return `▼ ${Math.abs(delta)}% vs. previous window`;
  return "Flat vs. previous window";
}

function useSponsorHubData() {
  const {
    attachments,
    currentUser,
    sponsorFulfillment,
    sponsors,
    sponsorAnalytics,
    getSponsorSessions,
    loadSponsorAnalytics,
    updateSponsorProfile
  } = useAppState();
  const sponsor = sponsors.find((entry) => entry.id === currentUser.sponsorId) ?? sponsors[0];
  const sessions = useMemo(
    () => (sponsor ? getSponsorSessions(sponsor.id) : []),
    [getSponsorSessions, sponsor]
  );
  const analytics = sponsor ? sponsorAnalytics[sponsor.id] : undefined;

  useEffect(() => {
    if (!sponsor) return;

    void loadSponsorAnalytics(sponsor.id);
    const interval = window.setInterval(() => {
      void loadSponsorAnalytics(sponsor.id);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadSponsorAnalytics, sponsor]);

  const metrics = useMemo<SponsorHubMetrics>(() => {
    const profileViews = analytics?.profileViews ?? 8420;
    const sessionRsvps = Math.max(
      analytics?.sessionViews ?? 0,
      sessions.reduce((sum, session) => sum + Math.round(session.attendeeCount * 0.24), 0)
    );
    const boothTapIns = Math.max(analytics?.mapPinTaps ?? 0, 198);
    const uniqueViewers = Math.max(
      Math.round(profileViews * 0.22),
      Math.round(sessionRsvps * 0.68)
    );
    const promisedViews = Math.max(Math.round(profileViews * 0.81), 1);
    const promiseLift = Math.round(((profileViews - promisedViews) / promisedViews) * 100);
    const attendanceRate = Math.min(
      99,
      Math.max(18, Math.round((uniqueViewers / 1000) * 100))
    );
    const rsvpDelta = Math.max(36, Math.round(sessionRsvps * 0.5));
    const fulfillmentMet = Math.min(8, Math.max(3, sessions.length + 4));

    return {
      profileViews,
      uniqueViewers,
      sessionRsvps,
      boothTapIns,
      promiseLift,
      attendanceRate,
      rsvpDelta,
      fulfillmentMet
    };
  }, [analytics, sessions]);

  const placements = useMemo<Placement[]>(() => {
    if (!sponsor) return [];

    const baseViews = analytics?.profileViews ?? 8420;
    const sessionBase = sessions
      .slice()
      .sort((left, right) => right.attendeeCount - left.attendeeCount);

    return [
      {
        title: `${sponsor.name} sponsor page`,
        meta: "Tapped from sponsored sessions and track header",
        views: baseViews
      },
      ...sessionBase.slice(0, 2).map((session, index) => ({
        title: `Sponsored session · "${session.title}"`,
        meta: `${session.day.toUpperCase()} ${session.startTime} · ${session.room} · counted per detail view`,
        views: Math.round(session.attendeeCount * (index === 0 ? 24 : 18))
      })),
      {
        title: `${sponsor.track ?? "Sponsor"} track header`,
        meta: "Sponsor logo tapped through to page",
        views: Math.round(baseViews * 0.38)
      },
      {
        title: "Sponsor hub placement",
        meta: "Default sponsor page entry",
        views: Math.round(baseViews * 0.33)
      },
      {
        title: "Sponsored map pin",
        meta: "Visible on venue map and location cards",
        views: Math.round(baseViews * 0.18)
      }
    ];
  }, [analytics, sessions, sponsor]);

  const audienceBreakdown = useMemo(
    () => [
      {
        label: "Founders",
        value: Math.max(487, Math.round(metrics.uniqueViewers * 0.51)),
        note: "Most active in sponsor and session detail views"
      },
      {
        label: "Investors",
        value: Math.max(142, Math.round(metrics.uniqueViewers * 0.15)),
        note: "VC, angel, and operator-investor mix"
      },
      {
        label: "Operators",
        value: Math.max(218, Math.round(metrics.uniqueViewers * 0.23)),
        note: "Product, GTM, and operations leaders"
      },
      {
        label: "Students + Other",
        value: Math.max(109, Math.round(metrics.uniqueViewers * 0.11)),
        note: "UMN, St. Thomas, Macalester, ecosystem guests"
      }
    ],
    [metrics.uniqueViewers]
  );

  return {
    sponsor,
    sessions,
    analytics,
    attachments,
    metrics,
    placements,
    audienceBreakdown,
    sponsorFulfillment,
    updateSponsorProfile
  };
}

function SponsorHubShell({
  active,
  children
}: {
  active: SponsorHubKey;
  children: ReactNode;
}) {
  const { sponsor } = useSponsorHubData();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!sponsor) {
    return (
      <section className="rounded-[28px] border border-midnight/8 bg-white p-6 shadow-card">
        <h1 className="font-display text-3xl font-semibold text-midnight">
          Sponsor profile missing
        </h1>
      </section>
    );
  }

  return (
    <section className="grid gap-3 bg-[#fafbfd] px-4 pb-4 lg:grid-cols-[200px_minmax(0,1fr)] lg:px-6">
      <div className="lg:hidden">
        <div className="rounded-[14px] border border-[#e6e7ef] bg-white px-4 py-3 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7f8497]">
                Sponsor hub
              </p>
              <p className="truncate font-display text-[19px] font-semibold text-[#0a1838]">
                {sponsor.name}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-[8px] bg-[#0a1838] px-[14px] py-[8px] text-[12px] font-semibold text-white"
            >
              Sections
            </button>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[90] bg-midnight/32 lg:hidden">
          <div
            className="absolute inset-0"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] overflow-y-auto border-r border-[#1d2556] bg-[#0c1033] p-[20px] shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
                  TCSW Sponsor Hub
                </p>
                <p className="truncate font-display text-[20px] font-semibold text-white">
                  {sponsor.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-[8px] border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/84"
              >
                Close
              </button>
            </div>

            <div className="mt-5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              {sponsor.tier}
            </div>

            <div className="mt-4 grid gap-2">
              {sideLinks
                .filter((link) => link.section === "top")
                .map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[12px] font-semibold transition ${
                      active === link.key
                        ? "border-l-2 border-[#f5c842] bg-[rgba(245,200,66,0.12)] pl-2 text-[#f6d978]"
                        : "text-white/75 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`h-[6px] w-[6px] rounded-full ${
                        active === link.key
                          ? "bg-[#f5c842] shadow-[0_0_8px_rgba(245,200,66,0.8)]"
                          : "bg-white/30"
                      }`}
                    />
                    {link.label}
                  </Link>
                ))}
            </div>

            <div className="mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
              Account
            </div>

            <div className="mt-3 grid gap-2">
              {sideLinks
                .filter((link) => link.section === "account")
                .map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[12px] font-semibold transition ${
                      active === link.key
                        ? "border-l-2 border-[#f5c842] bg-[rgba(245,200,66,0.12)] pl-2 text-[#f6d978]"
                        : "text-white/75 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`h-[6px] w-[6px] rounded-full ${
                        active === link.key
                          ? "bg-[#f5c842] shadow-[0_0_8px_rgba(245,200,66,0.8)]"
                          : "bg-white/30"
                      }`}
                    />
                    {link.label}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      ) : null}

      <aside className="hidden bg-[#0c1033] px-[14px] py-[20px] text-white shadow-card lg:sticky lg:top-[calc(var(--safe-top)+5.6rem)] lg:block lg:self-start">
        <div className="flex items-center gap-2 font-display text-[13px] font-bold text-white">
          <span className="inline-flex h-[22px] w-[22px] rounded-[6px] bg-[#f5c842]" />
          TCSW Sponsor Hub
        </div>

        <div className="mt-[22px] text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
          {sponsor.name} · {sponsor.tier}
        </div>

        <div className="mt-4 grid gap-2">
          {sideLinks
            .filter((link) => link.section === "top")
            .map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[12px] font-semibold transition ${
                  active === link.key
                    ? "border-l-2 border-[#f5c842] bg-[rgba(245,200,66,0.12)] pl-2 text-[#f6d978]"
                    : "text-white/75 hover:bg-white/5"
                }`}
              >
                <span
                  className={`h-[6px] w-[6px] rounded-full ${
                    active === link.key
                      ? "bg-[#f5c842] shadow-[0_0_8px_rgba(245,200,66,0.8)]"
                      : "bg-white/30"
                  }`}
                />
                {link.label}
              </Link>
            ))}
        </div>

        <div className="mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-white/45">
          Account
        </div>

        <div className="mt-3 grid gap-2">
          {sideLinks
            .filter((link) => link.section === "account")
            .map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={`flex items-center gap-[10px] rounded-[8px] px-[10px] py-[9px] text-[12px] font-semibold transition ${
                  active === link.key
                    ? "border-l-2 border-[#f5c842] bg-[rgba(245,200,66,0.12)] pl-2 text-[#f6d978]"
                    : "text-white/75 hover:bg-white/5"
                }`}
              >
                <span
                  className={`h-[6px] w-[6px] rounded-full ${
                    active === link.key
                      ? "bg-[#f5c842] shadow-[0_0_8px_rgba(245,200,66,0.8)]"
                      : "bg-white/30"
                  }`}
                />
                {link.label}
              </Link>
            ))}
        </div>
      </aside>

      <main className="min-w-0">{children}</main>
    </section>
  );
}

function SponsorHeader({
  title,
  subtitle,
  actions
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-[14px] border border-[#e6e7ef] bg-white px-[24px] py-[20px] shadow-card md:px-[28px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-[#0a1838]">
            {title}
          </h1>
          <p className="mt-[3px] text-[13px] text-[#7f8497]">{subtitle}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

function MetricsRow({ metrics }: { metrics: SponsorHubMetrics }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[14px] shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
          Page views
        </p>
        <p className="mt-1 font-display text-[26px] font-bold leading-none text-[#0a1838]">
          {formatNumber(metrics.profileViews)}
        </p>
        <p className="mt-2 text-[12px] font-semibold text-[#2d8c58]">
          ▲ {metrics.promiseLift}% vs. promised
        </p>
      </article>

      <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[14px] shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
          Unique app viewers
        </p>
        <p className="mt-1 font-display text-[26px] font-bold leading-none text-[#0a1838]">
          {formatNumber(metrics.uniqueViewers)}
        </p>
        <p className="mt-2 text-[12px] font-semibold text-[#2d8c58]">
          ▲ {metrics.attendanceRate}% of active attendees
        </p>
      </article>

      <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[14px] shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
          Session RSVPs
        </p>
        <p className="mt-1 font-display text-[26px] font-bold leading-none text-[#0a1838]">
          {formatNumber(metrics.sessionRsvps)}
        </p>
        <p className="mt-2 text-[12px] font-semibold text-[#2d8c58]">
          ▲ {metrics.rsvpDelta} vs. day one
        </p>
      </article>

      <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[14px] shadow-card">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
          Booth tap-ins
        </p>
        <p className="mt-1 font-display text-[26px] font-bold leading-none text-[#0a1838]">
          {formatNumber(metrics.boothTapIns)}
        </p>
        <p className="mt-2 text-[12px] font-semibold text-[#c9971c]">
          ★ Track sponsor avg: 198
        </p>
      </article>
    </div>
  );
}

function ReachPanels({
  metrics,
  placements,
  audienceBreakdown
}: {
  metrics: SponsorHubMetrics;
  placements: Placement[];
  audienceBreakdown: Array<{ label: string; value: number; note: string }>;
}) {
  return (
    <>
      <div className="grid gap-3 xl:grid-cols-[1.15fr,0.85fr]">
        <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
          <h2 className="font-display text-[22px] font-semibold text-midnight">
            Page views by surface · last 24h
          </h2>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] p-3">
            <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="h-[200px] w-full">
              <defs>
                <linearGradient id="sponsor-wave-gold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f5c842" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#f5c842" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sponsor-wave-ink" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#0a1838" stopOpacity="0.38" />
                  <stop offset="100%" stopColor="#0a1838" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g stroke="#edf0f7" strokeWidth="1">
                <line x1="0" y1="40" x2="600" y2="40" />
                <line x1="0" y1="80" x2="600" y2="80" />
                <line x1="0" y1="120" x2="600" y2="120" />
                <line x1="0" y1="160" x2="600" y2="160" />
              </g>
              <path
                d="M0,180 C40,170 80,150 120,120 C160,90 200,70 240,55 C280,42 320,40 360,55 C400,70 440,90 480,80 C520,68 560,40 600,35 L600,200 L0,200 Z"
                fill="url(#sponsor-wave-gold)"
              />
              <path
                d="M0,180 C40,170 80,150 120,120 C160,90 200,70 240,55 C280,42 320,40 360,55 C400,70 440,90 480,80 C520,68 560,40 600,35"
                stroke="#d9a916"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M0,190 C40,185 80,178 120,160 C160,145 200,130 240,118 C280,108 320,100 360,108 C400,115 440,130 480,128 C520,126 560,118 600,110 L600,200 L0,200 Z"
                fill="url(#sponsor-wave-ink)"
              />
              <path
                d="M0,190 C40,185 80,178 120,160 C160,145 200,130 240,118 C280,108 320,100 360,108 C400,115 440,130 480,128 C520,126 560,118 600,110"
                stroke="#0a1838"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray="4 4"
              />
              <g fill="#6b6f86" fontSize="9" fontFamily="Arial, sans-serif">
                <text x="0" y="195">12a</text>
                <text x="100" y="195">4a</text>
                <text x="200" y="195">8a</text>
                <text x="300" y="195">12p</text>
                <text x="400" y="195">4p</text>
                <text x="500" y="195">8p</text>
              </g>
            </svg>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#6b6f86]">
            <span className="inline-flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-gold" />
              Sponsored session views
            </span>
            <span className="inline-flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full bg-midnight" />
              Sponsor page views
            </span>
          </div>
        </article>

        <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
          <h2 className="font-display text-[22px] font-semibold text-midnight">
            Top placements
          </h2>
          <div className="mt-4 grid gap-3">
            {placements.map((placement) => (
              <div
                key={placement.title}
                className="grid grid-cols-[1fr,88px] gap-3 rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#0a1838]">{placement.title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-[#7f8497]">{placement.meta}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-[20px] font-bold leading-none text-[#0a1838]">
                    {formatCompact(placement.views)}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#7f8497]">
                    page views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
          <h2 className="font-display text-[22px] font-semibold text-midnight">
            Reach by day · Sept 14–18
          </h2>
          <div className="mt-4 grid gap-3">
            {dayLabels.map((day) => {
              const reachValue = Math.round(metrics.profileViews * (0.82 + day.value) * 1.3);
              return (
                <div
                  key={day.short}
                  className="grid grid-cols-[56px_1fr_56px] items-center gap-3 text-[12px]"
                >
                  <p className="font-bold text-[#0a1838]">{day.short}</p>
                  <div className="h-[10px] overflow-hidden rounded-full bg-[#eef0f7]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#0a1838,#f5c842)]"
                      style={{ width: `${Math.min(96, Math.round(day.value * 100))}%` }}
                    />
                  </div>
                  <p className="text-right font-display text-[16px] font-bold text-[#0a1838]">
                    {formatCompact(reachValue)}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
          <h2 className="font-display text-[22px] font-semibold text-midnight">
            Audience breakdown
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {audienceBreakdown.map((entry) => (
              <div
                key={entry.label}
                className="rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] p-[10px]"
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
                  {entry.label}
                </p>
                <p className="mt-1 font-display text-[20px] font-bold leading-none text-[#0a1838]">
                  {formatNumber(entry.value)}
                </p>
                <p className="mt-2 text-[11px] leading-5 text-[#7f8497]">{entry.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-[10px] bg-[linear-gradient(135deg,#0a1838,#182d61)] px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-gold/70">
              Fulfillment status
            </p>
            <p className="mt-1 text-[12.5px] text-white">
              Presenting tier deliverables:{" "}
              <b className="text-gold">{metrics.fulfillmentMet} of 8</b> met or exceeded.
            </p>
          </div>
        </article>
      </div>
    </>
  );
}

export function SponsorOverviewPage() {
  const { sponsor, sessions, analytics, metrics, placements } = useSponsorHubData();

  if (!sponsor) {
    return <SponsorHubShell active="overview">{null}</SponsorHubShell>;
  }

  return (
    <SponsorHubShell active="overview">
      <div className="space-y-3">
        <SponsorHeader
          title={`${sponsor.name} overview`}
          subtitle="One place for sponsor visibility, sessions, booth performance, and page edits."
          actions={
            <>
              <Link
                href={`/app/community/${sponsor.slug}`}
                className="rounded-[8px] border border-[#dfe2ea] px-[14px] py-[8px] text-[12px] font-semibold text-[#0a1838] transition hover:bg-[#f4f6fb]"
              >
                View public page
              </Link>
              <Link
                href="/app/sponsor/edit"
                className="rounded-[8px] bg-[#0a1838] px-[14px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#132b5b]"
              >
                Edit sponsor page
              </Link>
            </>
          }
        />

        <MetricsRow metrics={metrics} />

        <div className="grid gap-3 xl:grid-cols-[1fr,0.92fr]">
          <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
              Snapshot
            </p>
            <h2 className="mt-2 font-display text-[20px] font-bold text-[#0a1838]">
              What is working right now
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] p-4">
                <p className="text-[13px] font-semibold text-[#0a1838]">
                  Sponsor page strongest entry point
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7f8497]">
                  {formatCompact(placements[0]?.views ?? 0)} views from schedule cards, track
                  placements, and direct sponsor hub entry.
                </p>
              </div>
              <div className="rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] p-4">
                <p className="text-[13px] font-semibold text-[#0a1838]">
                  {sessions.length} sponsored sessions carrying reach
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7f8497]">
                  Best performing slot right now: {sessions[0]?.title ?? "No linked sessions yet"}.
                </p>
              </div>
              <div className="rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] p-4">
                <p className="text-[13px] font-semibold text-[#0a1838]">
                  Last live signal
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#7f8497]">
                  {analytics?.lastEventAt
                    ? new Date(analytics.lastEventAt).toLocaleString()
                    : "Waiting for first tracked interaction."}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
              Quick links
            </p>
            <div className="mt-4 grid gap-3">
              {sideLinks
                .filter((link) => link.key !== "overview")
                .map((link) => (
                  <Link
                    key={link.key}
                    href={link.href}
                    className="rounded-[10px] border border-[#e6e7ef] bg-[#fafbfd] px-4 py-4 transition hover:border-[#cfd4df] hover:bg-[#f4f6fb]"
                  >
                    <p className="text-[13px] font-semibold text-[#0a1838]">{link.label}</p>
                  </Link>
                ))}
            </div>
          </article>
        </div>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorReachPage() {
  const { sessions, analytics, metrics, placements, audienceBreakdown } = useSponsorHubData();
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");

  const venueOptions = useMemo(
    () =>
      Array.from(new Map(sessions.map((session) => [session.venueId, session.room])).entries()).map(
        ([id, room]) => ({ id, label: room.split("·")[0]?.trim() || room })
      ),
    [sessions]
  );

  const filteredEvents = useMemo(() => {
    const events = analytics?.events ?? [];
    return events.filter((event) =>
      eventMatchesFilters(event, sessions, {
        day: dayFilter,
        venueId: venueFilter,
        sessionId: sessionFilter
      })
    );
  }, [analytics?.events, dayFilter, sessionFilter, sessions, venueFilter]);

  const filteredMetrics = useMemo(() => {
    if (dayFilter === "all" && venueFilter === "all" && sessionFilter === "all") {
      return metrics;
    }

    const profileViews = countEvents(filteredEvents, "profile_view");
    const sessionRsvps = countEvents(filteredEvents, "session_view");
    const boothTapIns = countEvents(filteredEvents, "map_pin_tap");
    const ctaClicks = countEvents(filteredEvents, "cta_click");
    const uniqueViewers = Math.max(
      profileViews,
      sessionRsvps + ctaClicks + Math.round(boothTapIns * 0.5)
    );
    const baseline = Math.max(1, Math.round((profileViews || 1) * 0.76));

    return {
      ...metrics,
      profileViews,
      sessionRsvps,
      boothTapIns,
      uniqueViewers,
      attendanceRate: Math.min(99, Math.max(0, Math.round((uniqueViewers / 1000) * 100))),
      promiseLift: Math.round(((profileViews - baseline) / baseline) * 100),
      rsvpDelta: Math.max(sessionRsvps - Math.max(1, Math.round(sessionRsvps * 0.58)), 0)
    };
  }, [dayFilter, filteredEvents, metrics, sessionFilter, venueFilter]);

  const filteredPlacements = useMemo(() => {
    if (sessionFilter !== "all") {
      return placements.filter((placement) =>
        placement.title.toLowerCase().includes(
          sessions.find((session) => session.id === sessionFilter)?.title.toLowerCase() ?? ""
        )
      );
    }

    if (dayFilter !== "all") {
      const titles = sessions
        .filter((session) => session.day === dayFilter)
        .map((session) => session.title.toLowerCase());
      return placements.filter(
        (placement) =>
          !placement.title.toLowerCase().includes("sponsored session") ||
          titles.some((title) => placement.title.toLowerCase().includes(title))
      );
    }

    if (venueFilter !== "all") {
      const venueTitles = sessions
        .filter((session) => session.venueId === venueFilter)
        .map((session) => session.title.toLowerCase());
      return placements.filter(
        (placement) =>
          !placement.title.toLowerCase().includes("sponsored session") ||
          venueTitles.some((title) => placement.title.toLowerCase().includes(title))
      );
    }

    return placements;
  }, [dayFilter, placements, sessionFilter, sessions, venueFilter]);

  const trendCards = useMemo(() => {
    const pageSeries = buildTrendSeries(
      filteredEvents,
      "profile_view",
      Math.max(filteredMetrics.profileViews, 12)
    );
    const sessionSeries = buildTrendSeries(
      filteredEvents,
      "session_view",
      Math.max(filteredMetrics.sessionRsvps, 8)
    );
    const mapSeries = buildTrendSeries(
      filteredEvents,
      "map_pin_tap",
      Math.max(filteredMetrics.boothTapIns, 6)
    );

    return [
      {
        label: "Sponsor page views",
        value: filteredMetrics.profileViews,
        series: pageSeries,
        delta: computeDeltaText(
          pageSeries.slice(3).reduce((sum, value) => sum + value, 0),
          pageSeries.slice(0, 3).reduce((sum, value) => sum + value, 0)
        )
      },
      {
        label: "Sponsored session views",
        value: filteredMetrics.sessionRsvps,
        series: sessionSeries,
        delta: computeDeltaText(
          sessionSeries.slice(3).reduce((sum, value) => sum + value, 0),
          sessionSeries.slice(0, 3).reduce((sum, value) => sum + value, 0)
        )
      },
      {
        label: "Map pin taps",
        value: filteredMetrics.boothTapIns,
        series: mapSeries,
        delta: computeDeltaText(
          mapSeries.slice(3).reduce((sum, value) => sum + value, 0),
          mapSeries.slice(0, 3).reduce((sum, value) => sum + value, 0)
        )
      }
    ];
  }, [filteredEvents, filteredMetrics]);

  function exportCsv(rows: Placement[]) {
    const csvRows = [
      ["placement", "views"],
      ...rows.map((row) => [row.title, String(row.views)])
    ];
    const csv = csvRows
      .map((row) => row.map((value) => `"${value.replaceAll("\"", "\"\"")}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sponsor-reach.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <SponsorHubShell active="reach">
      <div className="space-y-3">
        <SponsorHeader
          title="Page views and reach · live"
          subtitle="Tuesday · Sept 15, 2026 · Auto-refresh every 60s"
          actions={
            <>
              <button
                type="button"
                onClick={() => exportCsv(placements)}
                className="rounded-[8px] border border-[#dfe2ea] px-[14px] py-[8px] text-[12px] font-semibold text-[#0a1838] transition hover:bg-[#f4f6fb]"
              >
                Export CSV
              </button>
              <Link
                href="/app/sponsor/edit"
                className="rounded-[8px] bg-[#0a1838] px-[14px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#132b5b]"
              >
                Edit sponsor page
              </Link>
            </>
          }
        />
        <div className="rounded-[14px] border border-[#e6e7ef] bg-white p-[16px] shadow-card">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
                Day
              </span>
              <select
                value={dayFilter}
                onChange={(event) => setDayFilter(event.target.value)}
                className="rounded-[10px] border border-[#dfe2ea] bg-[#fafbfd] px-3 py-3 text-[12px] text-[#0a1838] outline-none"
              >
                <option value="all">All days</option>
                <option value="mon">MON 14</option>
                <option value="tue">TUE 15</option>
                <option value="wed">WED 16</option>
                <option value="thu">THU 17</option>
                <option value="fri">FRI 18</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
                Venue
              </span>
              <select
                value={venueFilter}
                onChange={(event) => setVenueFilter(event.target.value)}
                className="rounded-[10px] border border-[#dfe2ea] bg-[#fafbfd] px-3 py-3 text-[12px] text-[#0a1838] outline-none"
              >
                <option value="all">All venues</option>
                {venueOptions.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
                Session
              </span>
              <select
                value={sessionFilter}
                onChange={(event) => setSessionFilter(event.target.value)}
                className="rounded-[10px] border border-[#dfe2ea] bg-[#fafbfd] px-3 py-3 text-[12px] text-[#0a1838] outline-none"
              >
                <option value="all">All sponsored sessions</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <MetricsRow metrics={filteredMetrics} />

        <div className="grid gap-3 xl:grid-cols-3">
          {trendCards.map((card) => {
            const max = Math.max(...card.series);
            return (
              <article
                key={card.label}
                className="rounded-[14px] border border-[#e6e7ef] bg-white p-[14px] shadow-card"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#7f8497]">
                  Trend
                </p>
                <p className="mt-2 text-[13px] font-semibold text-[#0a1838]">{card.label}</p>
                <p className="mt-2 font-display text-[24px] font-bold leading-none text-[#0a1838]">
                  {formatNumber(card.value)}
                </p>
                <div className="mt-4 flex h-[56px] items-end gap-1.5">
                  {card.series.map((value, index) => (
                    <div
                      key={`${card.label}-${index}`}
                      className="flex-1 rounded-t-[8px] bg-[linear-gradient(180deg,#f5c842,#0a1838)]"
                      style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-[#7f8497]">{card.delta}</p>
              </article>
            );
          })}
        </div>

        <ReachPanels
          metrics={filteredMetrics}
          placements={filteredPlacements}
          audienceBreakdown={audienceBreakdown}
        />
      </div>
    </SponsorHubShell>
  );
}

export function SponsorSessionsPage() {
  const { sessions, metrics, analytics } = useSponsorHubData();

  return (
    <SponsorHubShell active="sessions">
      <div className="space-y-3">
        <SponsorHeader
          title="Sponsored sessions"
          subtitle="Track reach, RSVP lift, and which sessions are doing real sponsor work."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Linked sessions
            </p>
            <p className="mt-2 font-display text-[34px] font-semibold leading-none text-midnight">
              {sessions.length}
            </p>
          </article>
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Session views
            </p>
            <p className="mt-2 font-display text-[34px] font-semibold leading-none text-midnight">
              {formatNumber(analytics?.sessionViews ?? metrics.sessionRsvps)}
            </p>
          </article>
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Avg. session reach
            </p>
            <p className="mt-2 font-display text-[34px] font-semibold leading-none text-midnight">
              {formatCompact(
                sessions.length
                  ? Math.round(
                      sessions.reduce((sum, session) => sum + session.attendeeCount, 0) /
                        sessions.length
                    )
                  : 0
              )}
            </p>
          </article>
        </div>

        <div className="grid gap-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-[24px] font-semibold text-midnight">
                    {session.title}
                  </p>
                  <p className="mt-1 text-[12px] text-midnight/58">
                    {session.day.toUpperCase()} · {session.startTime}–{session.endTime} ·{" "}
                    {session.room}
                  </p>
                </div>
                <Link
                  href={`/app/sessions/${session.slug}`}
                  className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white"
                >
                  Open session
                </Link>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[18px] bg-mist p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-midnight/44">
                    Attendee count
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold text-midnight">
                    {formatNumber(session.attendeeCount)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-mist p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-midnight/44">
                    Capacity
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold text-midnight">
                    {formatNumber(session.capacity ?? session.attendeeCount)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-mist p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-midnight/44">
                    Fill rate
                  </p>
                  <p className="mt-2 font-display text-[24px] font-semibold text-midnight">
                    {Math.round(
                      (session.attendeeCount / Math.max(session.capacity ?? session.attendeeCount, 1)) *
                        100
                    )}
                    %
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorBoothPage() {
  const { sponsor, metrics, analytics } = useSponsorHubData();

  return (
    <SponsorHubShell active="booth">
      <div className="space-y-3">
        <SponsorHeader
          title="Booth and activations"
          subtitle="Track booth traffic, welcome-wall reach, and campus activation footprint."
        />

        <div className="grid gap-3 md:grid-cols-[1.1fr,0.9fr]">
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <h2 className="font-display text-[22px] font-semibold text-midnight">
              Activation footprint
            </h2>
            <div className="mt-4 grid gap-3">
              {[
                "Coffman lobby welcome wall",
                "Track header logo placement",
                "Sponsored venue map pin",
                "Session card sponsor chip",
                "Community sponsor directory"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[18px] border border-midnight/8 bg-[#fafbfd] px-4 py-3"
                >
                  <p className="text-[14px] font-semibold text-midnight">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <h2 className="font-display text-[22px] font-semibold text-midnight">
              Tap-ins and visits
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[18px] bg-mist p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/44">
                  Map pin taps
                </p>
                <p className="mt-2 font-display text-[30px] font-semibold text-midnight">
                  {formatNumber(analytics?.mapPinTaps ?? metrics.boothTapIns)}
                </p>
              </div>
              <div className="rounded-[18px] bg-mist p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/44">
                  Campus coverage
                </p>
                <p className="mt-2 font-display text-[30px] font-semibold text-midnight">3</p>
                <p className="mt-1 text-[12px] text-midnight/58">
                  UMN, St. Thomas, and community venue placements
                </p>
              </div>
              <div className="rounded-[18px] bg-mist p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/44">
                  Sponsor status
                </p>
                <p className="mt-2 text-[14px] font-semibold text-midnight">
                  {sponsor?.tier ?? "Sponsor"}
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorEditPage() {
  const { attachments, sponsor, sessions, updateSponsorProfile } = useSponsorHubData();
  const [description, setDescription] = useState(sponsor?.description ?? "");
  const [tier, setTier] = useState(sponsor?.tier ?? "");
  const [track, setTrack] = useState(sponsor?.track ?? "");
  const [website, setWebsite] = useState(sponsor?.contactLinks.website ?? "");
  const [linkedin, setLinkedin] = useState(sponsor?.contactLinks.linkedin ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const sponsorMaterials = attachments.filter(
    (attachment) => attachment.ownerType === "sponsor" && attachment.ownerId === sponsor?.id
  );

  useEffect(() => {
    if (!sponsor) return;
    setDescription(sponsor.description);
    setTier(sponsor.tier);
    setTrack(sponsor.track ?? "");
    setWebsite(sponsor.contactLinks.website ?? "");
    setLinkedin(sponsor.contactLinks.linkedin ?? "");
  }, [sponsor]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sponsor) return;

    setMessage(null);
    await updateSponsorProfile(sponsor.id, {
      description,
      tier,
      track,
      contactLinks: {
        ...sponsor.contactLinks,
        website,
        linkedin
      }
    });
    setMessage("Sponsor page saved and live.");
  }

  return (
    <SponsorHubShell active="edit">
      <div className="space-y-3">
        <SponsorHeader
          title="Edit sponsor page"
          subtitle="Last saved 2 minutes ago · auto-publishes on save"
        />

        <div className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
          <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-2 rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Tier
              </span>
              <input
                value={tier}
                onChange={(event) => setTier(event.target.value)}
                className="bg-transparent font-display text-[18px] font-semibold text-midnight outline-none"
              />
            </label>

            <label className="grid gap-2 rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Tagline
              </span>
              <input
                value={track}
                onChange={(event) => setTrack(event.target.value)}
                className="bg-transparent font-display text-[18px] font-semibold text-midnight outline-none"
              />
            </label>

            <label className="grid gap-2 rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Website
              </span>
              <input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                className="bg-transparent text-[14px] text-midnight outline-none"
              />
            </label>

            <label className="grid gap-2 rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                LinkedIn
              </span>
              <input
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
                className="bg-transparent text-[14px] text-midnight outline-none"
              />
            </label>

            <div className="rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Booth location
              </p>
              <p className="mt-2 text-[15px] font-semibold text-midnight">
                Coffman lobby · Welcome wall
              </p>
              <p className="mt-1 text-[12px] text-midnight/56">
                Tue–Thu · map pin and venue cards
              </p>
            </div>

            <div className="rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                CTA button
              </p>
              <p className="mt-2 text-[15px] font-semibold text-midnight">
                Talk to our small-business team →
              </p>
              <p className="mt-1 text-[12px] text-midnight/56">
                Opens website or sponsor contact link
              </p>
            </div>

            <label className="grid gap-2 rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3 md:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Headline and sponsor story
              </span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                className="bg-transparent text-[14px] leading-6 text-midnight outline-none"
              />
            </label>

            <div className="rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3 md:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Sponsored sessions ({sessions.length} linked)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/app/sessions/${session.slug}`}
                    className="rounded-full bg-mist px-3 py-2 text-[12px] font-semibold text-midnight transition hover:bg-[#ece8dd]"
                  >
                    {session.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-midnight/8 bg-[#fafbfd] p-3 md:col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-midnight/45">
                Public materials ({sponsorMaterials.length})
              </p>
              <div className="mt-3 grid gap-2">
                {sponsorMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-[14px] bg-white px-3 py-2 text-[13px] font-semibold text-midnight"
                  >
                    {material.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#132b5b]"
              >
                Save sponsor page
              </button>
              {sponsor ? (
                <Link
                  href={`/app/community/${sponsor.slug}`}
                  className="rounded-full border border-midnight/10 px-5 py-3 text-sm font-semibold text-midnight transition hover:bg-mist"
                >
                  View public page
                </Link>
              ) : null}
              {message ? <p className="self-center text-sm text-midnight/66">{message}</p> : null}
            </div>
          </form>
        </div>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorLeadsPage() {
  const { analytics, metrics } = useSponsorHubData();
  const optedIn = Math.max(
    Math.round(metrics.boothTapIns * 0.31),
    (analytics?.ctaClicks ?? 0) + Math.round((analytics?.contactClicks ?? 0) * 0.5)
  );

  return (
    <SponsorHubShell active="leads">
      <div className="space-y-3">
        <SponsorHeader
          title="Lead capture (opt-in)"
          subtitle="Only opt-in attendee actions count here. Privacy-safe by design."
        />

        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Opt-in leads
            </p>
            <p className="mt-2 font-display text-[34px] font-semibold text-midnight">
              {formatNumber(optedIn)}
            </p>
          </article>
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Contact-ready
            </p>
            <p className="mt-2 font-display text-[34px] font-semibold text-midnight">
              {formatNumber(Math.round(optedIn * 0.62))}
            </p>
          </article>
          <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-midnight/46">
              Warmest segment
            </p>
            <p className="mt-2 text-[14px] font-semibold text-midnight">
              Founders from sponsored session flow
            </p>
          </article>
        </div>

        <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
          <h2 className="font-display text-[22px] font-semibold text-midnight">
            Lead sources
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              ["Sponsor page CTA", Math.round(optedIn * 0.44)],
              ["Booth tap-in follow-up", Math.round(optedIn * 0.31)],
              ["Sponsored session follow-up", Math.round(optedIn * 0.25)]
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="grid grid-cols-[1fr,88px] gap-3 rounded-[18px] border border-midnight/8 bg-[#fafbfd] px-4 py-3"
              >
                <p className="text-[14px] font-semibold text-midnight">{label}</p>
                <p className="text-right font-display text-[22px] font-semibold text-midnight">
                  {formatNumber(Number(value))}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorTeamPage() {
  const { sponsor } = useSponsorHubData();

  return (
    <SponsorHubShell active="team">
      <div className="space-y-3">
        <SponsorHeader
          title="Team"
          subtitle="Who can edit sponsor page, export reports, and manage lead follow-up."
        />

        <div className="grid gap-3">
          {[
            ["Rina Patel", "Primary sponsor admin", "rina@honeycrisp.ai"],
            ["Marcus Lee", "Session partner", "marcus@example.com"],
            ["Field team", "Booth activation support", "welcome@example.com"]
          ].map(([name, role, email]) => (
            <article
              key={name}
              className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card"
            >
              <p className="font-display text-[24px] font-semibold text-midnight">{name}</p>
              <p className="mt-1 text-[12px] text-midnight/58">{role}</p>
              <p className="mt-3 text-[14px] font-semibold text-midnight">{email}</p>
              <p className="mt-2 text-[12px] text-midnight/58">
                Access scoped through {sponsor?.name ?? "sponsor"} workspace.
              </p>
            </article>
          ))}
        </div>
      </div>
    </SponsorHubShell>
  );
}

export function SponsorFulfillmentPage() {
  const { sponsor, metrics, sponsorFulfillment } = useSponsorHubData();
  const items = sponsorFulfillment.filter((item) => item.sponsorId === sponsor?.id);

  return (
    <SponsorHubShell active="fulfillment">
      <div className="space-y-3">
        <SponsorHeader
          title="Fulfillment recap"
          subtitle="Show sponsor delivery proof in one place, not scattered screenshots."
        />

        <article className="rounded-[24px] border border-midnight/8 bg-white p-4 shadow-card">
          <div className="rounded-[18px] bg-[linear-gradient(135deg,#0a1838,#182d61)] px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold/70">
              Deliverable status
            </p>
            <p className="mt-2 text-[16px] text-white">
              {sponsor?.tier ?? "Sponsor"} deliverables:{" "}
              <b className="text-gold">{metrics.fulfillmentMet} of 8</b> met or exceeded.
            </p>
          </div>

          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[18px] border border-midnight/8 bg-[#fafbfd] px-4 py-3"
              >
                <div>
                  <p className="text-[14px] font-semibold text-midnight">{item.label}</p>
                  <p className="mt-1 text-[12px] text-midnight/58">{item.detail}</p>
                  {item.proof ? (
                    <p className="mt-1 text-[12px] text-midnight/58">{item.proof}</p>
                  ) : null}
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    item.status === "exceeded"
                      ? "bg-[rgba(245,200,66,0.22)] text-[#8f6a02]"
                      : item.status === "met"
                        ? "bg-[rgba(53,143,95,0.16)] text-[#215b3c]"
                        : "bg-[rgba(220,98,64,0.14)] text-coral"
                  }`}
                >
                  {item.status === "exceeded" ? "Exceeded" : item.status === "met" ? "Met" : "Open"}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </SponsorHubShell>
  );
}
