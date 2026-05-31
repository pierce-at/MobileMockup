"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ConflictBanner } from "@/components/conflict-banner";
import { DaySwitcher } from "@/components/day-switcher";
import { SessionCard } from "@/components/session-card";
import type { DayKey, Session } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";
import { sortSessionsByTime } from "@/lib/utils/time";

const FILTER_STORAGE_KEY = "tcsw-schedule-filters-v1";

type CapacityFilter = "all" | "open" | "filling" | "full";

export default function SchedulePage() {
  const {
    currentUser,
    sessions,
    sponsors,
    venues,
    savedSchedule,
    conflictingSessionIds,
    isSaved,
    isReady,
    saveSession,
    removeSavedSession,
    scheduleControl
  } = useAppState();

  const [activeDay, setActiveDay] = useState<DayKey>("wed");
  const [activeTag, setActiveTag] = useState("All");
  const [activeVenueId, setActiveVenueId] = useState("all");
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [capacityFilter, setCapacityFilter] = useState<CapacityFilter>("all");
  const [activeFormat, setActiveFormat] = useState("all");
  const [activeSponsorId, setActiveSponsorId] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [chipsCollapsed, setChipsCollapsed] = useState(false);

  const tags = ["All", "Sponsored", "Featured", "AI", "FinTech", "Community", "Social"];
  const canPreviewDraft = currentUser.appRole === "admin" || currentUser.appRole === "host";
  const scheduleIsPublic = scheduleControl.isPublished || canPreviewDraft;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<{
        activeTag: string;
        activeVenueId: string;
        search: string;
        savedOnly: boolean;
        capacityFilter: CapacityFilter;
        activeFormat: string;
        activeSponsorId: string;
      }>;

      if (parsed.activeTag) setActiveTag(parsed.activeTag);
      if (parsed.activeVenueId) setActiveVenueId(parsed.activeVenueId);
      if (parsed.search) setSearch(parsed.search);
      if (typeof parsed.savedOnly === "boolean") setSavedOnly(parsed.savedOnly);
      if (parsed.capacityFilter) setCapacityFilter(parsed.capacityFilter);
      if (parsed.activeFormat) setActiveFormat(parsed.activeFormat);
      if (parsed.activeSponsorId) setActiveSponsorId(parsed.activeSponsorId);
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({
        activeTag,
        activeVenueId,
        search,
        savedOnly,
        capacityFilter,
        activeFormat,
        activeSponsorId
      })
    );
  }, [activeFormat, activeSponsorId, activeTag, activeVenueId, capacityFilter, savedOnly, search]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function handleScroll() {
      setChipsCollapsed(window.scrollY > 120);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const availableVenues = useMemo(
    () =>
      venues.filter((venue) =>
        sessions.some((session) => session.day === activeDay && session.venueId === venue.id)
      ),
    [activeDay, sessions, venues]
  );

  const filteredSessions = useMemo(
    () =>
      sortSessionsByTime(
        sessions.filter((session) => {
          const haystack = [
            session.title,
            session.description,
            session.room,
            ...session.tags,
            ...session.speakers.map((speaker) => `${speaker.name} ${speaker.company}`)
          ]
            .join(" ")
            .toLowerCase();

          const matchesDay = session.day === activeDay;
          const matchesSearch = !search || haystack.includes(search.toLowerCase());
          const matchesTag =
            activeTag === "All" ||
            session.tags.includes(activeTag) ||
            (activeTag === "Sponsored" && session.isSponsored) ||
            (activeTag === "Featured" && session.isFeatured);
          const matchesVenue = activeVenueId === "all" || session.venueId === activeVenueId;
          const matchesSaved = !savedOnly || isSaved(session.id);
          const status = getCapacityStatus(session);
          const matchesCapacity = capacityFilter === "all" || status === capacityFilter;
          const matchesFormat = activeFormat === "all" || (session.format ?? "Session") === activeFormat;
          const matchesSponsor = activeSponsorId === "all" || session.sponsorId === activeSponsorId;

          return (
            matchesDay &&
            matchesSearch &&
            matchesTag &&
            matchesVenue &&
            matchesSaved &&
            matchesCapacity &&
            matchesFormat &&
            matchesSponsor
          );
        })
      ),
    [activeDay, activeFormat, activeSponsorId, activeTag, activeVenueId, capacityFilter, isSaved, savedOnly, search, sessions]
  );

  const sessionGroups = useMemo(() => {
    const groups: Array<{ startTime: string; label: string; sessions: typeof filteredSessions }> = [];

    filteredSessions.forEach((session) => {
      const existing = groups.find((group) => group.startTime === session.startTime);
      if (existing) {
        existing.sessions.push(session);
        existing.label = getTimeBlockLabel(existing.sessions);
        return;
      }

      groups.push({
        startTime: session.startTime,
        label: getTimeBlockLabel([session]),
        sessions: [session]
      });
    });

    return groups;
  }, [filteredSessions]);

  const conflictCount = conflictingSessionIds.size;
  const savedCount = savedSchedule.length;
  const venueCount = new Set(sessions.map((session) => session.venueId)).size;
  const formatOptions = Array.from(new Set(sessions.map((session) => session.format ?? "Session")));
  const sponsorOptions = sponsors.filter((sponsor) =>
    sessions.some((session) => session.sponsorId === sponsor.id)
  );
  const toggleSavedSession = (sessionId: string) => {
    const toggle = isSaved(sessionId) ? removeSavedSession : saveSession;
    return toggle(sessionId);
  };

  const clearFilters = () => {
    setActiveTag("All");
    setActiveVenueId("all");
    setSearch("");
    setSavedOnly(false);
    setCapacityFilter("all");
    setActiveFormat("all");
    setActiveSponsorId("all");
  };

  return (
    <section className="space-y-4">
      <div className="ms-summary">
        <div className="lbl">Twin Cities Startup Week</div>
        <h1 className="big">Browse the schedule</h1>
        <p className="mt-2 text-[13px] text-white/78">
          Release {scheduleControl.releaseVersion} ·{" "}
          {scheduleControl.hasUnpublishedChanges ? "Draft updates waiting" : "Live and current"}
        </p>
        <div className="ms-stats">
          <div className="ms-stat">
            <div className="n">5</div>
            <div className="l">Days</div>
          </div>
          <div className="ms-stat">
            <div className="n">{venueCount}</div>
            <div className="l">Venues</div>
          </div>
          <div className="ms-stat">
            <div className="n">{savedCount}</div>
            <div className="l">Saved</div>
          </div>
        </div>
      </div>

      {!scheduleIsPublic ? (
        <div className="rounded-[14px] border border-midnight/8 bg-white p-6 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Schedule pending</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-midnight">
            The final schedule is still being prepared.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-midnight/72">
            Reviews, room assignments, and logistics are still being finalized. You can still send
            in a session idea while the public agenda is locked.
          </p>
          <Link
            href="/app/submit"
            className="mt-5 inline-flex rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white"
          >
            Open submission form
          </Link>
        </div>
      ) : (
        <>
          <ConflictBanner count={conflictCount} />

          <div className="sticky-day-rail p-4">
            <DaySwitcher activeDay={activeDay} onChange={setActiveDay} />
            <div className="mt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen((value) => !value)}
                aria-expanded={filtersOpen}
                aria-controls="schedule-filter-panel"
                aria-label={filtersOpen ? "Close filters" : "Open filters"}
                className="fixed right-4 top-[calc(var(--safe-top)+6.75rem)] z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-midnight/10 bg-white/92 text-midnight shadow-card transition hover:bg-[#e6eef1] md:right-8"
              >
                {filtersOpen ? (
                  <span className="text-[18px] font-semibold leading-none">×</span>
                ) : (
                  <span className="relative block h-[14px] w-[16px]" aria-hidden="true">
                    <span className="absolute left-0 top-[1px] h-[2px] w-full rounded-full bg-current" />
                    <span className="absolute left-[2px] top-[6px] h-[2px] w-[12px] rounded-full bg-current" />
                    <span className="absolute left-[5px] top-[11px] h-[2px] w-[6px] rounded-full bg-current" />
                  </span>
                )}
              </button>
            </div>

            <div
              id="schedule-filter-panel"
              className={`${filtersOpen ? "mt-3 grid" : "hidden"} gap-2 sm:grid-cols-[1.2fr,0.8fr]`}
            >
              <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
                  Search
                </span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search sessions, speakers, tags"
                  className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none placeholder:text-midnight/40"
                />
              </label>

              <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
                  Venue
                </span>
                <select
                  value={activeVenueId}
                  onChange={(event) => setActiveVenueId(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
                >
                  <option value="all">All venues</option>
                  {availableVenues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className={`${filtersOpen ? "mt-2 grid" : "hidden"} gap-2 sm:grid-cols-2 xl:grid-cols-5`}>
              <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
                  Capacity
                </span>
                <select
                  value={capacityFilter}
                  onChange={(event) => setCapacityFilter(event.target.value as CapacityFilter)}
                  className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
                >
                  <option value="all">All status</option>
                  <option value="open">Open</option>
                  <option value="filling">Filling</option>
                  <option value="full">Full</option>
                </select>
              </label>

              <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
                  Format
                </span>
                <select
                  value={activeFormat}
                  onChange={(event) => setActiveFormat(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
                >
                  <option value="all">All formats</option>
                  {formatOptions.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
                  Sponsor
                </span>
                <select
                  value={activeSponsorId}
                  onChange={(event) => setActiveSponsorId(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
                >
                  <option value="all">All sponsors</option>
                  {sponsorOptions.map((sponsor) => (
                    <option key={sponsor.id} value={sponsor.id}>
                      {sponsor.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => setSavedOnly((value) => !value)}
                className={`rounded-[16px] px-3 py-2.5 text-[12px] font-semibold transition ${
                  savedOnly
                    ? "bg-midnight text-white"
                    : "border border-midnight/8 bg-mist text-midnight/68"
                }`}
              >
                Saved only
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-[16px] border border-midnight/8 bg-white px-3 py-2.5 text-[12px] font-semibold text-midnight/68 transition hover:bg-mist"
              >
                Clear filters
              </button>

            </div>

            <div
              className={`no-scrollbar overflow-x-auto transition-all duration-200 ${
                chipsCollapsed
                  ? "mt-0 max-h-0 opacity-0 pointer-events-none"
                  : "mt-3 max-h-16 opacity-100"
              }`}
            >
              <div className="flex gap-1.5">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  className={`rounded-full px-3 py-1 text-[10px] font-medium ${
                    activeTag === tag
                      ? "bg-[rgba(251,189,25,0.2)] text-midnight"
                      : "bg-mist text-midnight/64"
                  }`}
                >
                  {tag}
                </button>
              ))}
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-midnight/8 bg-white p-3 shadow-card sm:p-4">
            {!isReady ? (
              <div className="grid min-h-[220px] place-items-center rounded-[12px] bg-mist/55 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                    Loading
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-midnight">
                    Pulling the live schedule.
                  </p>
                </div>
              </div>
            ) : sessionGroups.length ? (
              sessionGroups.map((group) => (
                <div key={group.startTime}>
                  <div className="mb-1.5 mt-1.5 flex items-center gap-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em] text-midnight/42">
                    <span>
                      {group.startTime} · {group.label}
                    </span>
                    <div className="h-px flex-1 bg-[linear-gradient(90deg,#e6e7ef,transparent)]" />
                  </div>

                  {group.sessions.map((session) => {
                    const sponsor = sponsors.find((item) => item.id === session.sponsorId);
                    const venue = venues.find((item) => item.id === session.venueId);
                    const saved = isSaved(session.id);
                    const isUpdated =
                      Boolean(scheduleControl.publishedAt) &&
                      Boolean(session.updatedAt) &&
                      new Date(session.updatedAt as string) >
                        new Date(scheduleControl.publishedAt as string);

                    return (
                      <SessionCard
                        key={session.id}
                        session={session}
                        sponsor={sponsor}
                        venue={venue}
                        isSaved={saved}
                        isConflicting={conflictingSessionIds.has(session.id)}
                        isUpdated={isUpdated}
                        variant="compact"
                        onToggleSave={toggleSavedSession}
                      />
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="grid min-h-[220px] place-items-center rounded-[12px] border border-dashed border-midnight/10 bg-mist/55 px-6 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                    No results
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-midnight">
                    Nothing matches those filters.
                  </p>
                  <p className="mt-2 text-[13px] leading-5 text-midnight/60">
                    Try another tag, clear the venue filter, or search with fewer keywords.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function getCapacityStatus(session: Session): CapacityFilter {
  if (!session.capacity) return "open";
  const ratio = session.attendeeCount / session.capacity;
  if (ratio >= 1) return "full";
  if (ratio >= 0.85) return "filling";
  return "open";
}

function getTimeBlockLabel(
  sessions: Array<{ title: string; isFeatured: boolean; isSponsored: boolean }>
) {
  if (sessions.some((session) => /lunch/i.test(session.title))) return "Lunch";
  if (sessions.some((session) => /breakfast/i.test(session.title))) return "Breakfast";
  if (sessions.some((session) => /happy hour|dinner|networking|demo night/i.test(session.title))) {
    return "Networking";
  }
  if (sessions.length > 1) return "Breakouts";
  if (sessions.some((session) => session.isFeatured)) return "Main Stage";
  if (sessions.some((session) => session.isSponsored)) return "Sponsored";
  return "Sessions";
}

