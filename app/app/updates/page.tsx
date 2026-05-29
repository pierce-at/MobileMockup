"use client";

import Link from "next/link";

import { useAppState } from "@/lib/state/app-state";

export default function UpdatesPage() {
  const { notifications, scheduleChanges, sessions } = useAppState();

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Updates</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">What changed</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
          Release notes, volunteer notices, and schedule changes in one feed.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Notifications</p>
          <div className="mt-4 grid gap-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-[22px] bg-mist p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl font-semibold text-midnight">{item.title}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-midnight/60">
                    {item.type.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-midnight/70">{item.body}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-midnight/52">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  {item.actionHref ? (
                    <Link
                      href={item.actionHref}
                      className="rounded-full bg-midnight px-3 py-1.5 text-[11px] font-semibold text-white"
                    >
                      Open
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Schedule changes</p>
          <div className="mt-4 grid gap-3">
            {scheduleChanges.map((change) => {
              const session = sessions.find((item) => item.id === change.sessionId);
              return (
                <div key={change.id} className="rounded-[22px] bg-mist p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xl font-semibold text-midnight">
                      {session?.title ?? "Session"}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        change.isPublished
                          ? "bg-[rgba(53,143,95,0.16)] text-[#215b3c]"
                          : "bg-[rgba(245,200,66,0.18)] text-[#8f6a02]"
                      }`}
                    >
                      {change.isPublished ? `Live v${change.releaseVersion}` : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-midnight/70">{change.summary}</p>
                  <p className="mt-3 text-xs text-midnight/52">
                    {new Date(change.createdAt).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
