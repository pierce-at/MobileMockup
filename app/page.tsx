import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(245,200,66,0.18),transparent_25%),linear-gradient(180deg,#08142f_0%,#08142f_42%,#f6f3ea_42%,#f6f3ea_100%)] px-4 py-5 md:px-8">
      <section className="hero-grid mx-auto max-w-[1360px] overflow-hidden rounded-[40px] border border-white/10 bg-midnight text-white shadow-card">
        <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.05fr,0.95fr] md:px-10 md:py-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
              Official attendee app
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[0.94] md:text-7xl">
              Twin Cities Startup Week,
              <span className="block text-gold">all in one place.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/74 md:text-lg">
              Browse the schedule, save sessions, find your venue, and keep up with the week from
              one mobile-friendly app.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app/schedule"
                className="rounded-full bg-gold px-6 py-3 font-semibold text-midnight transition hover:translate-y-[-1px]"
              >
                Open the schedule
              </Link>
              <Link
                href="/app/community"
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 font-semibold text-white"
              >
                Explore sponsors
              </Link>
              <Link
                href="/app/hub"
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 font-semibold text-white"
              >
                View app map
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                "Save sessions and build your personal week",
                "Open venue directions from the map",
                "Discover sponsors, speakers, and community"
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    Attendee app
                  </p>
                  <p className="mt-2 text-sm text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="gold-stripe rounded-[36px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
            <div className="mx-auto flex max-w-[360px] flex-col gap-4 rounded-[34px] border border-white/10 bg-[#f7f4ed] p-4 text-midnight shadow-glow">
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-gold">Your week</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
                  Keep your sessions, venues, and updates in one view.
                </h2>
              </div>

              <div className="rounded-[28px] border border-midnight/8 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-coral">Saved session</p>
                    <p className="mt-1 font-display text-xl font-semibold">
                      Banking the Next 10M
                    </p>
                  </div>
                  <span className="rounded-full bg-[rgba(245,200,66,0.18)] px-3 py-1 text-xs font-semibold text-[#8f6a02]">
                    Saved
                  </span>
                </div>
                <p className="mt-3 text-sm text-midnight/68">Wed 10:00 AM · UMN Carlson</p>
              </div>

              <div className="rounded-[28px] border border-midnight/8 bg-mist p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-midnight/50">Venue map</p>
                <p className="mt-2 font-display text-lg font-semibold">
                  Open directions with one tap
                </p>
                <p className="mt-2 text-sm text-midnight/68">
                  Jump from a saved session to the venue map and hand off to Apple Maps or Google
                  Maps when you need turn-by-turn help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
