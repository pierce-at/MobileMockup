"use client";

import Link from "next/link";
import { clsx } from "clsx";

import type { Session, Sponsor, Venue } from "@/lib/domain/types";

type SessionCardProps = {
  session: Session;
  sponsor?: Sponsor;
  venue?: Venue;
  isSaved: boolean;
  isConflicting: boolean;
  isUpdated?: boolean;
  onToggleSave: (sessionId: string) => void;
  variant?: "default" | "compact";
};

export function SessionCard({
  session,
  sponsor,
  venue,
  isSaved,
  isConflicting,
  isUpdated = false,
  onToggleSave,
  variant = "default"
}: SessionCardProps) {
  const isCompact = variant === "compact";
  const sessionHref = `/app/sessions/${session.slug}`;
  const speakerLine = session.speakers.length
    ? session.speakers
        .slice(0, 2)
        .map((speaker) => speaker.name)
        .join(", ") + (session.speakers.length > 2 ? ` +${session.speakers.length - 2}` : "")
    : null;

  const compactTags = [
    session.isFeatured ? "Keynote" : null,
    session.isSponsored && sponsor ? `Sponsored · ${sponsor.name}` : null,
    session.tags[0] ?? null,
    session.attendeeCount > 150 ? "Filling" : null
  ].filter(Boolean) as string[];

  return (
    <article
      className={clsx(
        "relative border bg-white transition",
        isCompact
          ? "mb-[8px] rounded-[18px] px-[14px] py-[14px] shadow-[0_6px_20px_-14px_rgba(12,73,90,0.18)]"
          : "rounded-[14px] p-5 shadow-card",
        isConflicting
          ? "border-coral/30 ring-1 ring-coral/20"
          : isCompact
            ? "border-[#ebedf5]"
            : "border-midnight/8 hover:border-midnight/16",
        session.isSponsored &&
          isCompact &&
          "border-[rgba(251,189,25,0.6)] bg-[linear-gradient(180deg,#fff7d6_0%,#ffffff_100%)]",
        session.isFeatured &&
          isCompact &&
          "border-[rgba(12,73,90,0.4)] bg-[linear-gradient(180deg,#f0f3fb_0%,#ffffff_100%)]"
      )}
    >
      <Link
        href={sessionHref}
        aria-label={`Open ${session.title}`}
        className="absolute inset-0 z-0 rounded-[inherit]"
      />

      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleSave(session.id);
        }}
        aria-label={isSaved ? "Saved" : "Save"}
        data-testid={`save-toggle-${session.id}`}
        className={clsx(
          "absolute right-[10px] top-[10px] z-10 grid place-items-center font-semibold transition touch-manipulation",
          isCompact ? "h-[24px] w-[24px] rounded-[7px] text-[13px]" : "rounded-full px-4 py-2 text-sm",
          isSaved
            ? "bg-gold text-midnight"
            : isCompact
              ? "bg-[#f1f3f9] text-midnight"
              : "bg-[rgba(12,73,90,0.06)] text-midnight"
        )}
      >
        {isSaved ? "?" : isCompact ? "+" : "Save"}
      </button>

      {isCompact ? (
        <div className="relative z-[1] pr-8 pointer-events-none">
          <div className="pr-1 font-display text-[16px] font-bold leading-[1.2] text-ink">
            {session.title}
          </div>

          {speakerLine ? (
            <p className="mt-1 text-[11px] font-normal text-[#5a6074]">
              {speakerLine}
            </p>
          ) : null}

          <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-normal text-midnight/56">
            <span className="inline-flex items-center gap-1">{session.room}</span>
            {venue?.name ? <span className="inline-flex items-center gap-1">· {venue.name}</span> : null}
            <span className="inline-flex items-center gap-1">· {getDurationLabel(session.startTime, session.endTime)}</span>
          </div>

          <div className="mt-2 flex gap-1 overflow-hidden whitespace-nowrap">
            {compactTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={clsx(
                  "shrink-0 rounded-[4px] px-[7px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]",
                  getCompactTagClass(tag)
                )}
              >
                {tag}
              </span>
            ))}
            {isUpdated ? (
              <span className="shrink-0 rounded-[4px] bg-[rgba(12,73,90,0.12)] px-[7px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-indigo">
                Updated
              </span>
            ) : null}
            {isConflicting ? (
              <span className="shrink-0 rounded-[4px] bg-[rgba(220,98,64,0.14)] px-[7px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] text-coral">
                Overlap
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="relative z-[1] pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
                {session.isSponsored && sponsor ? (
                  <span className="rounded-full bg-[rgba(251,189,25,0.18)] px-3 py-1 text-gold">
                    Sponsored · {sponsor.name}
                  </span>
                ) : null}
                {session.isFeatured ? (
                  <span className="rounded-full bg-[rgba(12,73,90,0.08)] px-3 py-1 text-midnight">
                    Featured
                  </span>
                ) : null}
                {isUpdated ? (
                  <span className="rounded-full bg-[rgba(12,73,90,0.14)] px-3 py-1 text-indigo">
                    Updated
                  </span>
                ) : null}
                {isConflicting ? (
                  <span className="rounded-full bg-[rgba(220,98,64,0.14)] px-3 py-1 text-coral">
                    Overlap
                  </span>
                ) : null}
              </div>
              <div>
                <p className="text-sm text-midnight/64">
                  {session.startTime} - {session.endTime}
                </p>
                <div className="mt-1 font-display text-2xl font-semibold leading-tight text-midnight">
                  {session.title}
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-midnight/72">
                  {session.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-midnight/68">
            <span>{venue?.name}</span>
            <span className="text-midnight/22">•</span>
            <span>{session.room}</span>
            <span className="text-midnight/22">•</span>
            <span>{session.attendeeCount} attending</span>
          </div>

          {session.speakers.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {session.speakers.map((speaker) => (
                <div
                  key={speaker.id}
                  className="flex items-center gap-2 rounded-full bg-mist px-3 py-2 text-sm text-midnight"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-midnight text-xs font-semibold text-white">
                    {speaker.avatar}
                  </span>
                  <span>
                    {speaker.name}
                    <span className="block text-xs text-midnight/56">{speaker.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </article>
  );
}

function getCompactTagClass(tag: string) {
  if (tag.startsWith("Sponsored")) return "bg-gold text-midnight";
  if (tag === "Filling") return "bg-midnight text-gold";
  if (tag.toLowerCase().includes("keynote") || tag.toLowerCase().includes("food")) {
    return "bg-[#e0f7ee] text-[#0a8f5c]";
  }
  if (tag.toLowerCase().includes("ai")) return "bg-[#ffe3e7] text-[#b91c2c]";
  if (tag.toLowerCase().includes("fintech")) return "bg-midnight text-gold";
  return "bg-[#eef0f7] text-midnight/60";
}

function getDurationLabel(startTime: string, endTime: string) {
  const [startTimePart, startMeridiem] = startTime.split(" ");
  const [startHourRaw, startMinuteRaw] = startTimePart.split(":").map(Number);
  const [endTimePart, endMeridiem] = endTime.split(" ");
  const [endHourRaw, endMinuteRaw] = endTimePart.split(":").map(Number);

  let startHour = startHourRaw % 12;
  let endHour = endHourRaw % 12;
  if (startMeridiem === "PM") startHour += 12;
  if (endMeridiem === "PM") endHour += 12;

  const duration = endHour * 60 + endMinuteRaw - (startHour * 60 + startMinuteRaw);
  return duration > 0 ? `${duration} min` : endTime;
}

