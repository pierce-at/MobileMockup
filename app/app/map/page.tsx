"use client";

import { useEffect, useMemo, useState } from "react";

import { DaySwitcher } from "@/components/day-switcher";
import { MapStage } from "@/components/map/map-stage";
import type { DayKey, Session, Venue } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";
import { DAY_LABELS, sortSessionsByTime } from "@/lib/utils/time";

type PinMode = "saved" | "day" | "now" | "all";

function getMapsUrl(venue: Venue, provider: "apple" | "google") {
  const query = encodeURIComponent(`${venue.name}, ${venue.address}`);
  if (provider === "apple") {
    return `https://maps.apple.com/?q=${query}&ll=${venue.lat},${venue.lng}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}&query_place_id=${query}`;
}

export default function MapPage() {
  const {
    sessions,
    venues,
    savedSchedule,
    isReady,
    isSaved,
    saveSession,
    removeSavedSession,
    logSponsorEvent
  } = useAppState();

  const [activeDay, setActiveDay] = useState<DayKey>("tue");
  const [venueCalendarDay, setVenueCalendarDay] = useState<DayKey>("tue");
  const [pinMode, setPinMode] = useState<PinMode>("saved");
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  const savedSessions = useMemo(
    () =>
      sortSessionsByTime(
        sessions.filter((session) =>
          savedSchedule.some((entry) => entry.sessionId === session.id)
        )
      ),
    [savedSchedule, sessions]
  );

  const daySessions = useMemo(
    () => sortSessionsByTime(sessions.filter((session) => session.day === activeDay)),
    [activeDay, sessions]
  );

  const nowSessions = useMemo(() => {
    const nowMinutes = getCurrentMinutes();
    const candidates = daySessions.filter((session) => {
      const start = parseClock(session.startTime);
      const end = parseClock(session.endTime);
      return nowMinutes <= end + 30 && nowMinutes >= start - 30;
    });

    return candidates.length ? candidates : daySessions.filter((session) => parseClock(session.startTime) >= nowMinutes).slice(0, 4);
  }, [daySessions]);

  const visibleSessionPool = useMemo(() => {
    if (pinMode === "all") return sessions;
    if (pinMode === "day") return daySessions;
    if (pinMode === "now") return nowSessions.length ? nowSessions : daySessions;
    return savedSessions.length ? savedSessions : daySessions;
  }, [daySessions, nowSessions, pinMode, savedSessions, sessions]);

  const visibleVenues = useMemo(
    () =>
      visibleSessionPool.reduce<Array<{ venue: Venue; session: Session }>>((collection, session) => {
        if (collection.some((entry) => entry.venue.id === session.venueId)) {
          return collection;
        }

        const venue = venues.find((entry) => entry.id === session.venueId);
        if (!venue) return collection;

        return [...collection, { venue, session }];
      }, []),
    [venues, visibleSessionPool]
  );

  useEffect(() => {
    if (!visibleVenues.length) {
      setSelectedVenueId(null);
      return;
    }

    if (!selectedVenueId || !visibleVenues.some((entry) => entry.venue.id === selectedVenueId)) {
      setSelectedVenueId(visibleVenues[0]?.venue.id ?? null);
    }
  }, [selectedVenueId, visibleVenues]);

  const selectedVenue =
    venues.find((entry) => entry.id === selectedVenueId) ?? visibleVenues[0]?.venue ?? null;

  const selectedVenueSavedSessions = useMemo(
    () =>
      sortSessionsByTime(
        savedSessions.filter((session) => session.venueId === selectedVenue?.id)
      ),
    [savedSessions, selectedVenue?.id]
  );

  const selectedVenueAllSessions = useMemo(
    () =>
      sortSessionsByTime(
        sessions.filter((session) => session.venueId === selectedVenue?.id)
      ),
    [selectedVenue?.id, sessions]
  );

  const selectedVenueCalendarSessions = useMemo(
    () => selectedVenueAllSessions.filter((session) => session.day === venueCalendarDay),
    [selectedVenueAllSessions, venueCalendarDay]
  );

  const nextStop =
    nowSessions.find((session) => savedSchedule.some((entry) => entry.sessionId === session.id)) ??
    savedSessions.find((session) => session.day === activeDay) ??
    savedSessions[0] ??
    null;

  const activeSession =
    (nextStop && selectedVenue?.id === nextStop.venueId ? nextStop : null) ??
    selectedVenueSavedSessions[0] ??
    selectedVenueAllSessions.find((session) => session.day === activeDay) ??
    selectedVenueAllSessions[0] ??
    visibleVenues[0]?.session ??
    null;

  const pins = visibleVenues.map(({ venue, session }) => ({
    venue,
    session,
    active: venue.id === selectedVenue?.id
  }));

  function handleVenueSelect(venueId: string, source: "list" | "map") {
    setSelectedVenueId(venueId);

    const sponsorSession =
      visibleSessionPool.find(
        (session) => session.venueId === venueId && session.sponsorId
      ) ??
      sessions.find((session) => session.venueId === venueId && session.sponsorId);

    if (sponsorSession?.sponsorId) {
      void logSponsorEvent(sponsorSession.sponsorId, "map_pin_tap", {
        venueId,
        sessionId: sponsorSession.id,
        source
      });
    }
  }

  if (!selectedVenue || !activeSession) {
    return null;
  }

  return (
    <section className="w-full max-w-full space-y-4 overflow-x-clip">
      <h1 className="sr-only">Event map</h1>

      <div className="sticky-day-rail w-full max-w-full rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card">
        <DaySwitcher activeDay={activeDay} onChange={setActiveDay} />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            { value: "saved", label: "My stops" },
            { value: "day", label: "This day" },
            { value: "now", label: "Now / next" },
            { value: "all", label: "All venues" }
          ].map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setPinMode(mode.value as PinMode)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                pinMode === mode.value ? "bg-midnight text-white" : "bg-mist text-midnight"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <MapStage
        session={activeSession}
        venue={selectedVenue}
        pins={pins}
        selectedVenueId={selectedVenue.id}
        onPinSelect={(venueId) => handleVenueSelect(venueId, "map")}
      />

      <div className="grid w-full max-w-full gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <article className="min-w-0 rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">
            {pinMode === "all" ? "Venue spread" : pinMode === "now" ? "Live route" : "My route venues"}
          </p>
          <div className="mt-4 grid gap-2.5">
            {visibleVenues.map(({ venue, session }) => {
              const savedCount = savedSessions.filter((item) => item.venueId === venue.id).length;
              const totalCount = sessions.filter((item) => item.venueId === venue.id).length;

              return (
                <button
                  key={venue.id}
                  type="button"
                  onClick={() => handleVenueSelect(venue.id, "list")}
                  className={`w-full min-w-0 rounded-[12px] border px-4 py-4 text-left transition ${
                    selectedVenue.id === venue.id
                      ? "border-midnight bg-mist"
                      : "border-midnight/8 bg-white hover:border-midnight/16"
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-display text-[15px] font-semibold leading-[1.2] text-midnight">
                        {venue.name}
                      </p>
                      <p className="mt-1 break-words text-[12px] leading-5 text-midnight/64">
                        {session.day ? `${DAY_LABELS[session.day]} - ` : ""}
                        {venue.address}
                      </p>
                    </div>
                    <div className="inline-flex shrink-0 self-start rounded-full bg-white px-3 py-2 text-xs font-semibold text-midnight">
                      {savedCount} mine - {totalCount} total
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="min-w-0 rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Selected venue</p>
          <h2 className="mt-2 break-words font-display text-[1.8rem] font-semibold leading-tight text-midnight sm:text-3xl">
            {selectedVenue.name}
          </h2>
          <p className="mt-2 break-words text-sm leading-5 text-midnight/64">
            {selectedVenue.address}
          </p>
          {selectedVenue.campus ? (
            <p className="mt-2 text-sm font-semibold text-midnight/66">
              Campus: {selectedVenue.campus}
            </p>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-midnight/72">
            {selectedVenue.transitNotes ||
              selectedVenue.parkingNotes ||
              "Venue guidance coming soon."}
          </p>
          {selectedVenue.accessibilityNotes ? (
            <p className="mt-2 text-sm leading-6 text-midnight/72">
              {selectedVenue.accessibilityNotes}
            </p>
          ) : null}

          {nextStop ? (
            <div className="mt-4 rounded-[12px] bg-mist px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                Next stop
              </p>
              <p className="mt-2 font-display text-[15px] font-semibold text-midnight">
                {nextStop.title}
              </p>
              <p className="mt-1 text-[12px] text-midnight/64">
                {DAY_LABELS[nextStop.day]} - {nextStop.startTime} - {nextStop.room}
              </p>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] bg-mist px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                My saved here
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-midnight">
                {selectedVenueSavedSessions.length}
              </p>
            </div>
            <div className="rounded-[12px] bg-mist px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                Total sessions here
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-midnight">
                {selectedVenueAllSessions.length}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={getMapsUrl(selectedVenue, "apple")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-midnight px-5 py-3 text-center text-sm font-semibold text-white sm:w-auto"
            >
              Open in Apple Maps
            </a>
            <a
              href={getMapsUrl(selectedVenue, "google")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full border border-midnight/12 px-5 py-3 text-center text-sm font-semibold text-midnight sm:w-auto"
            >
              Open in Google Maps
            </a>
            {selectedVenue.mapLink ? (
              <a
                href={selectedVenue.mapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border border-midnight/12 px-5 py-3 text-center text-sm font-semibold text-midnight sm:w-auto"
              >
                Venue guide
              </a>
            ) : null}
          </div>
        </article>
      </div>

      <div className="grid w-full max-w-full gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <article className="min-w-0 rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">My events here</p>
          <div className="mt-4 grid gap-2.5">
            {!isReady ? (
              <div className="rounded-[12px] border border-dashed border-midnight/10 bg-mist px-5 py-8 text-center text-sm text-midnight/64">
                Loading venue schedule.
              </div>
            ) : selectedVenueSavedSessions.length ? (
              selectedVenueSavedSessions.map((session) => (
                <div
                  key={session.id}
                  className="min-w-0 rounded-[12px] border border-midnight/8 bg-mist px-4 py-4"
                >
                  <p className="break-words font-display text-[15px] font-semibold leading-[1.2] text-midnight">
                    {session.title}
                  </p>
                  <p className="mt-1 break-words text-[12px] leading-5 text-midnight/64">
                    {DAY_LABELS[session.day]} - {session.startTime} - {session.endTime}
                  </p>
                  <p className="mt-1 break-words text-[12px] text-midnight/60">{session.room}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[12px] border border-dashed border-midnight/10 bg-mist px-5 py-8 text-center text-sm text-midnight/64">
                You do not have any saved sessions at this venue yet.
              </div>
            )}
          </div>
        </article>

        <article className="min-w-0 rounded-[14px] border border-midnight/8 bg-white p-4 shadow-card sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">All events at venue</p>
              <h3 className="mt-2 break-words font-display text-[1.8rem] font-semibold leading-tight text-midnight sm:text-3xl">
                {selectedVenue.name} calendar
              </h3>
            </div>
            <div className="inline-flex shrink-0 self-start rounded-full bg-mist px-4 py-2 text-sm font-semibold text-midnight">
              {selectedVenueCalendarSessions.length} on {DAY_LABELS[venueCalendarDay]}
            </div>
          </div>

          <div className="mt-4">
            <DaySwitcher activeDay={venueCalendarDay} onChange={setVenueCalendarDay} />
          </div>

          <div className="mt-4 grid gap-2.5">
            {selectedVenueCalendarSessions.length ? (
              selectedVenueCalendarSessions.map((session) => {
                const saved = isSaved(session.id);

                return (
                  <div
                    key={session.id}
                    className="min-w-0 rounded-[12px] border border-midnight/8 px-4 py-4"
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="break-words font-display text-[15px] font-semibold leading-[1.2] text-midnight">
                          {session.title}
                        </p>
                        <p className="mt-1 break-words text-[12px] leading-5 text-midnight/64">
                          {session.startTime} - {session.endTime} - {session.room}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => (saved ? removeSavedSession(session.id) : saveSession(session.id))}
                        className={`inline-flex shrink-0 self-start rounded-[10px] px-3 py-2 text-[12px] font-semibold ${
                          saved
                            ? "bg-[rgba(251,189,25,0.18)] text-[#8f6a02]"
                            : "bg-midnight text-white"
                        }`}
                      >
                        {saved ? "Saved" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[12px] border border-dashed border-midnight/10 bg-mist px-5 py-8 text-center text-sm text-midnight/64">
                No sessions scheduled at this venue on {DAY_LABELS[venueCalendarDay]}.
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

function parseClock(value: string) {
  const [timePart, meridiem] = value.split(" ");
  const [hourRaw, minute] = timePart.split(":").map(Number);
  let hour = hourRaw % 12;
  if (meridiem === "PM") hour += 12;
  return hour * 60 + minute;
}

function getCurrentMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}
