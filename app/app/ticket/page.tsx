"use client";

const EVENTBRITE_URL =
  process.env.NEXT_PUBLIC_EVENTBRITE_EVENT_URL ?? "https://www.eventbrite.com/";

export default function TicketPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Tickets</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Ticket and check-in</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
          Eventbrite stays the source of truth for registration and QR check-in. This app hands off cleanly instead of rebuilding ticketing.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr,0.92fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Eventbrite handoff</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-midnight">
            Open your registration and QR code
          </h2>
          <p className="mt-3 text-sm leading-6 text-midnight/70">
            For MVP, ticketing stays external. That keeps payment, registration, and event check-in stable while the app focuses on schedule, maps, sponsors, and operations.
          </p>
          <a
            href={EVENTBRITE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white"
          >
            Open Eventbrite
          </a>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">What comes later</p>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-midnight/72">
            <p>Embed deep links into attendee account context.</p>
            <p>Show session-specific registration links where needed.</p>
            <p>Sync attendance states back into sponsor and operations reporting.</p>
          </div>
        </article>
      </div>
    </section>
  );
}
