"use client";

import Link from "next/link";
import Image from "next/image";
import { writeOnboardingSkipFlag } from "@/lib/onboarding/storage";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(860px_420px_at_88%_0%,rgba(251,189,25,0.14),transparent_58%),linear-gradient(180deg,#0c495a_0%,#0e5365_42%,#f5f7f8_42%,#f5f7f8_100%)] px-4 py-5 md:px-8">
      <section className="hero-grid mx-auto max-w-[1360px] overflow-hidden rounded-[12px] border border-white/10 bg-midnight text-white shadow-card">
        <div className="grid gap-10 px-6 py-8 md:grid-cols-[1.05fr,0.95fr] md:px-10 md:py-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs uppercase tracking-[0.28em] text-gold">
              <Image src="/tcsw-logo.png" alt="" width={180} height={56} className="h-5 w-auto object-contain" priority />
              <span>Official attendee app</span>
            </div>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold leading-[0.94] md:text-7xl">
              Twin Cities Startup Week,
              <span className="block text-gold">all in one place.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/74 md:text-lg">
              Let people land here first, then move into guided setup, schedule, maps, and role-specific flows when they are ready.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app/onboarding"
                className="rounded-full bg-gold px-6 py-3 font-semibold text-midnight transition hover:translate-y-[-1px]"
              >
                Start setup
              </Link>
              <Link
                href="/app/schedule"
                onClick={() => writeOnboardingSkipFlag(true)}
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 font-semibold text-white"
              >
                Skip to schedule
              </Link>
              <Link
                href="/app/hub"
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 font-semibold text-white"
              >
                View app map
              </Link>
              <Link
                href="/concept/index.html"
                className="rounded-full border border-white/12 bg-white/6 px-6 py-3 font-semibold text-white"
              >
                View concept walkthrough
              </Link>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                "Pick role and preview seeded accounts fast",
                "Link account, interests, and first saved session",
                "Move into sponsor, host, or admin surfaces with context"
              ].map((item) => (
                <div key={item} className="rounded-[12px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                    Onboarding first
                  </p>
                  <p className="mt-2 text-sm text-white/82">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="gold-stripe rounded-[12px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
            <div className="mx-auto flex max-w-[360px] flex-col gap-4 rounded-[10px] border border-white/10 bg-[#f5f7f8] p-4 text-midnight shadow-glow">
              <div className="rounded-[16px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-5 text-white">
                <p className="text-xs uppercase tracking-[0.28em] text-gold">First stop</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">
                  Landing page first, guided setup on click.
                </h2>
              </div>

              <div className="rounded-[16px] border border-midnight/8 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-coral">Role switch</p>
                    <p className="mt-1 font-display text-xl font-semibold">
                      attendee - sponsor - host - admin
                    </p>
                  </div>
                  <span className="rounded-full bg-[rgba(251,189,25,0.18)] px-3 py-1 text-xs font-semibold text-[#8f6a02]">
                    Preview
                  </span>
                </div>
                <p className="mt-3 text-sm text-midnight/68">
                  Setup page handles first-run guidance and testing shortcuts in one place.
                </p>
              </div>

              <div className="rounded-[16px] border border-midnight/8 bg-mist p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-midnight/50">Demo path</p>
                <p className="mt-2 font-display text-lg font-semibold">
                  Show the full attendee journey in one click.
                </p>
                <p className="mt-2 text-sm text-midnight/68">
                  Jump from first-run setup into schedule, venue map, sponsor discovery, and profile flows without losing demo context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
