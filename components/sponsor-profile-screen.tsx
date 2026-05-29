"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { ContactField } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

const fieldLabels: Record<ContactField, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  website: "Website"
};

export function SponsorProfileScreen({ slug }: { slug: string }) {
  const { sponsors, attachments, getSponsorSessions, logSponsorEvent } = useAppState();
  const sponsor = sponsors.find((item) => item.slug === slug);
  const hasLoggedView = useRef(false);

  useEffect(() => {
    if (!sponsor || hasLoggedView.current) return;
    hasLoggedView.current = true;
    void logSponsorEvent(sponsor.id, "profile_view", { slug: sponsor.slug });
  }, [logSponsorEvent, sponsor]);

  if (!sponsor) {
    return (
      <section className="rounded-[28px] border border-midnight/8 bg-white p-6 shadow-card">
        <h1 className="font-display text-3xl font-semibold text-midnight">Sponsor not found</h1>
      </section>
    );
  }

  const sessions = getSponsorSessions(sponsor.id);
  const materials = attachments.filter(
    (attachment) =>
      attachment.ownerType === "sponsor" &&
      attachment.ownerId === sponsor.id &&
      attachment.visibility === "public"
  );
  const contactEntries = Object.entries(sponsor.contactLinks).filter((entry): entry is [ContactField, string] => Boolean(entry[1]));

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">{sponsor.tier}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">{sponsor.name}</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.24em] text-white/55">
          {sponsor.track ?? "Community partner"}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">{sponsor.description}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,0.92fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Featured sessions</p>
          <div className="mt-4 grid gap-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                href={`/app/sessions/${session.slug}`}
                className="rounded-[22px] bg-mist p-4 transition hover:bg-[#ece8dd]"
              >
                <p className="font-display text-xl font-semibold text-midnight">{session.title}</p>
                <p className="mt-1 text-sm text-midnight/64">
                  {session.startTime} - {session.endTime}
                </p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Connect with sponsor</p>
          <div className="mt-4 grid gap-3">
            {contactEntries.map(([field, value]) => {
              const href = field === "email" ? `mailto:${value}` : /^https?:\/\//.test(value) ? value : `https://${value}`;
              return (
                <a
                  key={field}
                  href={href}
                  target={field === "email" ? undefined : "_blank"}
                  rel={field === "email" ? undefined : "noreferrer"}
                  onClick={() => {
                    void logSponsorEvent(sponsor.id, "contact_click", {
                      field,
                      destination: value
                    });
                    void logSponsorEvent(sponsor.id, "cta_click", {
                      field,
                      destination: value
                    });
                  }}
                  className="flex items-center justify-between rounded-[22px] border border-midnight/8 px-4 py-4 transition hover:border-midnight/16 hover:bg-mist"
                >
                  <div>
                    <p className="font-semibold text-midnight">{fieldLabels[field]}</p>
                    <p className="mt-1 text-sm text-midnight/64">{value}</p>
                  </div>
                  <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
                    Open
                  </span>
                </a>
              );
            })}
          </div>
        </article>
      </div>

      {materials.length ? (
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Sponsor materials</p>
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
        </article>
      ) : null}
    </section>
  );
}
