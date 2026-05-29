"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useAppState } from "@/lib/state/app-state";

export default function CommunityPage() {
  const { sponsors, isReady } = useAppState();
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("All");
  const [tier, setTier] = useState("All");

  const tracks = ["All", ...new Set(sponsors.map((sponsor) => sponsor.track).filter(Boolean))];
  const tiers = ["All", ...new Set(sponsors.map((sponsor) => sponsor.tier))];

  const filteredSponsors = useMemo(
    () =>
      sponsors.filter((sponsor) => {
        const matchesQuery =
          !query ||
          [sponsor.name, sponsor.description, sponsor.track, sponsor.tier]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesTrack = track === "All" || sponsor.track === track;
        const matchesTier = tier === "All" || sponsor.tier === tier;
        return matchesQuery && matchesTrack && matchesTier;
      }),
    [query, sponsors, tier, track]
  );

  return (
    <section className="space-y-4">
      <div className="ms-summary">
        <div className="lbl">Community</div>
        <h1 className="big">Ecosystem behind week.</h1>
        <div className="ms-stats">
          <div className="ms-stat">
            <div className="n">{sponsors.length}</div>
            <div className="l">Sponsors</div>
          </div>
          <div className="ms-stat">
            <div className="n">{tracks.length - 1}</div>
            <div className="l">Tracks</div>
          </div>
          <div className="ms-stat">
            <div className="n">{tiers.length - 1}</div>
            <div className="l">Tiers</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-midnight/8 bg-white p-4 shadow-card">
        <div className="grid gap-2 sm:grid-cols-[1.1fr,0.9fr,0.7fr]">
          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[12px] text-midnight/48">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sponsors, tracks, categories"
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none placeholder:text-midnight/40"
            />
          </label>

          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
              Track
            </span>
            <select
              value={track}
              onChange={(event) => setTrack(event.target.value)}
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
            >
              {tracks.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
              Tier
            </span>
            <select
              value={tier}
              onChange={(event) => setTier(event.target.value)}
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
            >
              {tiers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isReady ? (
        filteredSponsors.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredSponsors.map((sponsor) => (
              <Link
                key={sponsor.id}
                href={`/app/community/${sponsor.slug}`}
                className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card transition hover:translate-y-[-2px]"
              >
                <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-midnight font-display text-xl font-semibold text-gold">
                  {sponsor.logo}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-[rgba(245,200,66,0.18)] px-3 py-1 text-[11px] font-semibold text-midnight">
                    {sponsor.tier}
                  </span>
                  {sponsor.track ? (
                    <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-semibold text-midnight/68">
                      {sponsor.track}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-3 font-display text-2xl font-semibold text-midnight">
                  {sponsor.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-midnight/72">{sponsor.description}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-midnight/10 bg-white/70 p-6 text-center shadow-card">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                No sponsors found
              </p>
              <p className="mt-2 font-display text-2xl font-semibold text-midnight">
                Nothing matches those filters.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-midnight/8 bg-white/70 p-6 text-center shadow-card">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
              Loading
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-midnight">
              Pulling sponsor directory.
            </p>
          </div>
        </div>
      )}

      <Link
        href="/app/connect"
        className="inline-flex rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white"
      >
        Open Connect directory
      </Link>
    </section>
  );
}
