"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ConflictBanner } from "@/components/conflict-banner";
import { DaySwitcher } from "@/components/day-switcher";
import type { DayKey, Session } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";
import { buildMultiSessionIcs, downloadIcs } from "@/lib/utils/calendar";
import { getRecommendedSessions } from "@/lib/utils/recommendations";
import { DAY_LABELS, sortSessionsByTime } from "@/lib/utils/time";

export default function MySchedulePage() {
  const {
    currentUser,
    sessions,
    savedSchedule,
    removeSavedSession,
    conflictingSessionIds,
    venues,
    sponsors,
    scheduleControl
  } = useAppState();
  const [activeDay, setActiveDay] = useState<DayKey>("wed");

  const selectedSessions = useMemo(
    () =>
      sortSessionsByTime(
        sessions.filter((session) =>
          savedSchedule.some((entry) => entry.sessionId === session.id)
        )
      ),
    [savedSchedule, sessions]
  );

  const daySessions = useMemo(
    () => selectedSessions.filter((session) => session.day === activeDay),
    [activeDay, selectedSessions]
  );

  const changedSessions = useMemo(
    () =>
      selectedSessions.filter(
        (session) =>
          session.updatedAt &&
          scheduleControl.publishedAt &&
          new Date(session.updatedAt) > new Date(scheduleControl.publishedAt)
      ),
    [scheduleControl.publishedAt, selectedSessions]
  );

  const recommendations = useMemo(
    () => getRecommendedSessions(sessions, savedSchedule, currentUser.interests, 3),
    [currentUser.interests, savedSchedule, sessions]
  );

  const uniqueVenueCount = new Set(selectedSessions.map((session) => session.venueId)).size;
  const conflictCount = conflictingSessionIds.size;
  const nextUp = selectedSessions[0];

  function exportWeek() {
    if (!selectedSessions.length) return;

    downloadIcs(
      "tcsw-my-week.ics",
      buildMultiSessionIcs(
        selectedSessions.map((session) => ({
          session,
          venue: venues.find((venue) => venue.id === session.venueId)
        }))
      )
    );
  }

  return (
    <section className="flex min-h-[calc(100vh-10rem)] flex-col gap-4">
      <div className="ms-summary">
        <div className="lbl">My TCSW 2026</div>
        <h1 className="big">My saved week</h1>
        <p className="relative z-[2] mt-1 text-[12px] text-white/78">
          {selectedSessions.length} sessions saved
        </p>
        <div className="ms-stats">
          <div className="ms-stat">
            <div className="n">5</div>
            <div className="l">Days</div>
          </div>
          <div className="ms-stat">
            <div className="n">{uniqueVenueCount}</div>
            <div className="l">Campuses</div>
          </div>
          <div className="ms-stat">
            <div className="n">{conflictCount}</div>
            <div className="l">Conflict</div>
          </div>
        </div>
        <div className="relative z-[2] mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportWeek}
            disabled={!selectedSessions.length}
            className="rounded-full bg-white px-4 py-2 text-[12px] font-semibold text-midnight disabled:cursor-not-allowed disabled:opacity-45"
          >
            Export to Apple / Android calendar
          </button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${
          changedSessions.length ? "xl:grid-cols-[1.05fr,0.95fr] xl:items-stretch" : ""
        }`}
      >
        <article className="flex min-h-[140px] flex-col rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:min-h-[168px] sm:p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Next up</p>
          {nextUp ? (
            <div className="mt-3 flex-1 rounded-[12px] bg-mist p-3 sm:p-4">
              <p className="break-words font-display text-[16px] font-bold leading-[1.2] text-midnight">
                {nextUp.title}
              </p>
              <p className="mt-1 break-words text-[12px] leading-5 text-midnight/64">
                {DAY_LABELS[nextUp.day]} · {nextUp.startTime} · {nextUp.room}
              </p>
            </div>
          ) : (
            <div className="mt-3 grid flex-1 place-items-center rounded-[12px] bg-mist px-5 text-center">
              <div>
                <p className="text-sm text-midnight/64">
                  Save a session to start building your week.
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Link
                    href="/app/schedule"
                    className="rounded-full bg-midnight px-4 py-2 text-[12px] font-semibold text-white"
                  >
                    Open schedule
                  </Link>
                  <Link
                    href="/app/onboarding"
                    className="rounded-full border border-midnight/10 px-4 py-2 text-[12px] font-semibold text-midnight"
                  >
                    Open onboarding
                  </Link>
                </div>
              </div>
            </div>
          )}
        </article>

        {changedSessions.length ? (
          <article className="flex min-h-[140px] flex-col rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:min-h-[168px] sm:p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-coral">Schedule updates</p>
            <div className="mt-3 grid flex-1 content-start gap-2 overflow-visible md:overflow-y-auto md:pr-1 md:[scrollbar-gutter:stable]">
              {changedSessions.slice(0, 3).map((session) => (
                <Link
                  key={session.id}
                  href={`/app/sessions/${session.slug}`}
                  className="rounded-[18px] bg-mist px-3 py-3 transition hover:bg-[#e6eef1] sm:px-4"
                >
                  <p className="break-words text-[15px] font-semibold leading-[1.2] text-midnight">
                    {session.title}
                  </p>
                  <p className="mt-1 text-[12px] text-midnight/64">
                    Updated {session.updatedAt ? new Date(session.updatedAt).toLocaleString() : ""}
                  </p>
                </Link>
              ))}
            </div>
          </article>
        ) : null}
      </div>

      <ConflictBanner count={conflictCount} />

      <div className="sticky-day-rail rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card">
        <DaySwitcher activeDay={activeDay} onChange={setActiveDay} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr] xl:items-stretch">
        <div className="flex min-h-0 flex-col rounded-[16px] border border-midnight/8 bg-[#f5f7f8] p-3 shadow-card md:h-[560px] md:min-h-[560px]">
          <div className="mb-3 rounded-[12px] border border-white/60 bg-white/80 px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
              {DAY_LABELS[activeDay]}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-midnight">
              {daySessions.length} session{daySessions.length === 1 ? "" : "s"} saved
            </p>
          </div>

          <div className="flex-1 space-y-2.5 overflow-visible md:overflow-y-auto md:pr-1 md:[scrollbar-gutter:stable]">
            {daySessions.map((session) => {
              const venue = venues.find((item) => item.id === session.venueId);
              const sponsor = sponsors.find((item) => item.id === session.sponsorId);
              const isConflict = conflictingSessionIds.has(session.id);
              const isUpdated =
                Boolean(scheduleControl.publishedAt) &&
                Boolean(session.updatedAt) &&
                new Date(session.updatedAt as string) >
                  new Date(scheduleControl.publishedAt as string);

              return (
                <TimelineCard
                  key={session.id}
                  session={session}
                  venueName={venue?.name}
                  sponsorName={sponsor?.name}
                  isConflict={isConflict}
                  isUpdated={isUpdated}
                  onRemove={() => removeSavedSession(session.id)}
                />
              );
            })}

            {!daySessions.length ? (
              <div className="grid min-h-[240px] place-items-center rounded-[12px] border border-dashed border-midnight/10 bg-white/55 px-6 text-center">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                    No saved sessions
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-midnight">
                    Nothing saved for this day yet.
                  </p>
                  <p className="mt-2 break-words text-[12px] leading-5 text-midnight/60">
                    Save sessions from the schedule and they will show up here automatically.
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Link
                      href="/app/schedule"
                      className="rounded-full bg-midnight px-4 py-2 text-[12px] font-semibold text-white"
                    >
                      Browse schedule
                    </Link>
                    <Link
                      href="/app/onboarding"
                      className="rounded-full border border-midnight/10 px-4 py-2 text-[12px] font-semibold text-midnight"
                    >
                      Open onboarding
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <article className="flex min-h-0 flex-col rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card md:h-[560px] md:min-h-[560px]">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Recommended for you</p>
          <div className="mt-4 grid flex-1 content-start gap-2.5 overflow-visible md:overflow-y-auto md:pr-1 md:[scrollbar-gutter:stable]">
            {recommendations.length ? (
              recommendations.map((session) => (
                <Link
                  key={session.id}
                  href={`/app/sessions/${session.slug}`}
                  className="rounded-[10px] border border-midnight/8 px-4 py-3 transition hover:border-midnight/16 hover:bg-mist"
                >
                  <p className="break-words font-display text-[16px] font-bold leading-[1.2] text-midnight">
                    {session.title}
                  </p>
                  <p className="mt-1 break-words text-[12px] leading-5 text-midnight/64">
                    {session.tags.join(" · ")}
                  </p>
                </Link>
              ))
            ) : (
              <div className="grid flex-1 place-items-center rounded-[12px] bg-mist px-5 text-center">
                <div>
                  <p className="text-sm text-midnight/64">
                    Pick interests and save a few sessions to make suggestions smarter.
                  </p>
                  <Link
                    href="/app/onboarding"
                    className="mt-3 inline-flex rounded-full border border-midnight/10 px-4 py-2 text-[12px] font-semibold text-midnight"
                  >
                    Tune onboarding
                  </Link>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function TimelineCard({
  session,
  venueName,
  sponsorName,
  isConflict,
  isUpdated,
  onRemove
}: {
  session: Session;
  venueName?: string;
  sponsorName?: string;
  isConflict: boolean;
  isUpdated: boolean;
  onRemove: () => void;
}) {
  const sessionHref = `/app/sessions/${session.slug}`;
  const [timeNumber, timePeriod] = session.startTime.split(" ");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-3 px-1">
        <div className="shrink-0 text-[12px] font-bold uppercase tracking-[0.08em] text-midnight/48">
          <span className="font-display text-[18px] font-semibold text-midnight">{timeNumber}</span>{" "}
          {timePeriod}
        </div>
        <div className="h-px flex-1 bg-midnight/10" />
      </div>

      <article
        className={`relative rounded-[18px] border bg-white p-[14px] shadow-[0_10px_30px_rgba(12,16,51,0.08)] ${
          isConflict ? "border-[#ffbac1]" : "border-[#ebedf5]"
        }`}
      >
        <Link
          href={sessionHref}
          aria-label={`Open ${session.title}`}
          className="absolute inset-0 z-0 rounded-[inherit]"
        />

        <div className="relative z-[1] pointer-events-none">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="break-words font-display text-[16px] font-bold leading-[1.2] text-midnight">
                {session.title}
              </div>
              <p className="mt-1 break-words text-[11px] font-normal leading-5 text-midnight/52">
                {venueName} · {session.room}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove();
              }}
              aria-label={`Remove ${session.title}`}
              className="pointer-events-auto inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[7px] bg-mist text-[13px] font-bold leading-none text-midnight"
            >
              ×
            </button>
          </div>

          <div className="mt-1 flex gap-1 overflow-hidden whitespace-nowrap">
            {sponsorName ? (
              <div className="inline-flex shrink-0 rounded-[4px] bg-[rgba(251,189,25,0.18)] px-[6px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#8f6a02]">
                Sponsored · {sponsorName}
              </div>
            ) : null}

            {isUpdated ? (
              <div className="inline-flex shrink-0 rounded-[4px] bg-[rgba(12,73,90,0.12)] px-[6px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-indigo">
                Updated
              </div>
            ) : null}

            {isConflict ? (
              <div className="inline-flex shrink-0 rounded-[4px] bg-[#ffe3e7] px-[6px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#b91c2c]">
                Overlap
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}

