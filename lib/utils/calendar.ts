import type { Session, Venue } from "@/lib/domain/types";

const DAY_DATE_MAP: Record<Session["day"], string> = {
  mon: "20260914",
  tue: "20260915",
  wed: "20260916",
  thu: "20260917",
  fri: "20260918"
};

function toTwentyFourHour(value: string) {
  const [time, meridiem] = value.split(" ");
  const [rawHour, minutes] = time.split(":").map(Number);
  let hour = rawHour;

  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}${String(minutes).padStart(2, "0")}00`;
}

export function buildSessionIcs(session: Session, venue?: Venue | null) {
  return buildCalendarIcs([
    {
      session,
      venue
    }
  ]);
}

export function buildMultiSessionIcs(entries: Array<{ session: Session; venue?: Venue | null }>) {
  return buildCalendarIcs(entries);
}

function buildCalendarIcs(entries: Array<{ session: Session; venue?: Venue | null }>) {
  const events = entries.flatMap(({ session, venue }) => {
    const day = DAY_DATE_MAP[session.day];
    const start = `${day}T${toTwentyFourHour(session.startTime)}`;
    const end = `${day}T${toTwentyFourHour(session.endTime)}`;
    const location = venue ? `${venue.name}, ${session.room}, ${venue.address}` : session.room;
    const description = `${session.description}\n\nVenue: ${location}`;

    return [
      "BEGIN:VEVENT",
      `UID:${session.id}@tcsw.beta.mn`,
      `DTSTAMP:${day}T000000Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcs(session.title)}`,
      `DESCRIPTION:${escapeIcs(description)}`,
      `LOCATION:${escapeIcs(location)}`,
      "END:VEVENT"
    ];
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BETA//TCSW//EN",
    ...events,
    "END:VCALENDAR"
  ].join("\r\n");
}

export function downloadIcs(filename: string, ics: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function buildGoogleCalendarUrl(session: Session, venue?: Venue | null) {
  const day = DAY_DATE_MAP[session.day];
  const start = `${day}T${toTwentyFourHour(session.startTime)}`;
  const end = `${day}T${toTwentyFourHour(session.endTime)}`;
  const location = venue ? `${venue.name}, ${session.room}, ${venue.address}` : session.room;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: session.title,
    dates: `${start}/${end}`,
    details: session.description,
    location
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}
