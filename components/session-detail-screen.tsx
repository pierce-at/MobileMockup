"use client";

import { useEffect, useRef } from "react";

import { buildGoogleCalendarUrl, buildSessionIcs, downloadIcs } from "@/lib/utils/calendar";
import { useAppState } from "@/lib/state/app-state";
import { getSessionRegistrationUrl } from "@/lib/integrations";

export function SessionDetailScreen({ slug }: { slug: string }) {
  const {
    currentUser,
    getSessionBySlug,
    sponsors,
    venues,
    attachments,
    isSaved,
    saveSession,
    removeSavedSession,
    conflictingSessionIds
  } = useAppState();
  const hasLoggedView = useRef(false);

  const session = getSessionBySlug(slug);
  const sponsor = sponsors.find((item) => item.id === session?.sponsorId);
  const venue = venues.find((item) => item.id === session?.venueId);
  const materials = attachments.filter(
    (attachment) =>
      attachment.ownerType === "session" &&
      attachment.ownerId === session?.id &&
      attachment.visibility === "public"
  );
  const saved = session ? isSaved(session.id) : false;

  useEffect(() => {
    if (!session || hasLoggedView.current) return;
    hasLoggedView.current = true;
    void import("@/lib/data/repository").then(({ getRepository }) => {
      void getRepository().logSessionEvent(session.id, "detail_view", currentUser.id, {
        slug: session.slug
      });
      if (session.sponsorId) {
        void getRepository().logSponsorEvent(session.sponsorId, "session_view", currentUser.id, {
          sessionId: session.id,
          slug: session.slug
        });
      }
    });
  }, [currentUser.id, session]);

  if (!session) {
    return (
      <section className="rounded-[14px] border border-midnight/8 bg-white p-6 shadow-card">
        <h1 className="font-display text-3xl font-semibold text-midnight">Session not found</h1>
      </section>
    );
  }

  const activeSession = session;
  const googleCalendarUrl = buildGoogleCalendarUrl(activeSession, venue);

  async function shareSession() {
    const shareData = {
      title: activeSession.title,
      text: `${activeSession.title} · ${venue?.name ?? activeSession.room}`,
      url: typeof window !== "undefined" ? window.location.href : undefined
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    if (shareData.url) {
      await navigator.clipboard.writeText(shareData.url);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[18px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-6 text-white shadow-card">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em]">
          {sponsor ? (
            <span className="rounded-full bg-[rgba(251,189,25,0.16)] px-3 py-1 text-gold">
              Sponsored · {sponsor.name}
            </span>
          ) : null}
          {conflictingSessionIds.has(activeSession.id) ? (
            <span className="rounded-full bg-[rgba(220,98,64,0.18)] px-3 py-1 text-[#ffb59d]">
              Overlaps your week
            </span>
          ) : null}
          {activeSession.updatedAt ? (
            <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">
              Updated {new Date(activeSession.updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-5xl">
          {activeSession.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">{activeSession.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              saved ? removeSavedSession(activeSession.id) : saveSession(activeSession.id)
            }
            className="rounded-full bg-gold px-5 py-3 font-semibold text-midnight"
          >
            {saved ? "Remove from My Week" : "Save to My Week"}
          </button>
          <button
            type="button"
            onClick={() => void shareSession()}
            className="rounded-full border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white"
          >
            Share session
          </button>
          <button
            type="button"
            onClick={() =>
              downloadIcs(`${activeSession.slug}.ics`, buildSessionIcs(activeSession, venue))
            }
            className="rounded-full border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white"
          >
            Add to Apple / Android
          </button>
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/12 bg-white/8 px-5 py-3 font-semibold text-white"
          >
            Add to Google Calendar
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Speakers</p>
          <div className="mt-4 grid gap-3">
            {activeSession.speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="flex items-start gap-3 rounded-[12px] bg-mist p-4"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-midnight font-semibold text-white">
                  {speaker.avatar}
                </div>
                <div>
                  <p className="font-display text-xl font-semibold text-midnight">{speaker.name}</p>
                  <p className="text-sm text-midnight/64">
                    {speaker.role} · {speaker.company}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-midnight/72">{speaker.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
            <p className="text-xs uppercase tracking-[0.24em] text-midnight/46">Venue</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-midnight">{venue?.name}</h2>
            <p className="mt-2 text-sm text-midnight/68">{activeSession.room}</p>
            <p className="mt-4 text-sm leading-6 text-midnight/72">{venue?.address}</p>
            {venue?.campus ? (
              <p className="mt-2 text-sm text-midnight/64">Campus: {venue.campus}</p>
            ) : null}
            {venue?.accessibilityNotes ? (
              <p className="mt-4 text-sm leading-6 text-midnight/72">{venue.accessibilityNotes}</p>
            ) : null}
            {activeSession.externalRegistrationUrl ? (
              <a
                href={getSessionRegistrationUrl(activeSession)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white"
              >
                Register on Eventbrite
              </a>
            ) : null}
          </div>
          {materials.length ? (
            <div className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Materials</p>
              <div className="mt-4 grid gap-2">
                {materials.map((material) => (
                  <a
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[18px] bg-mist px-4 py-3 text-sm font-semibold text-midnight"
                  >
                    {material.title}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
          {sponsor ? (
            <div className="rounded-[14px] bg-[linear-gradient(135deg,rgba(251,189,25,0.14),rgba(255,255,255,0.8))] p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Track sponsor</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-[10px] bg-midnight font-display text-lg font-semibold text-gold">
                  {sponsor.logo}
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-midnight">
                    {sponsor.name}
                  </h3>
                  <p className="text-sm text-midnight/64">{sponsor.tier}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-midnight/72">{sponsor.description}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
