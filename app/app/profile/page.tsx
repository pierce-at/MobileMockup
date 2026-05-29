"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import type { ContactField } from "@/lib/domain/types";
import { INTEREST_OPTIONS } from "@/lib/domain/interests";
import { useAppState } from "@/lib/state/app-state";

const fields: ContactField[] = ["email", "linkedin", "website"];

const roleDestinations = {
  sponsor: { href: "/app/sponsor", label: "Sponsor dashboard" },
  host: { href: "/app/workspace", label: "Host workspace" },
  admin: { href: "/app/admin", label: "Admin console" }
} as const;

export default function ProfilePage() {
  const {
    auth,
    currentUser,
    isSupabaseEnabled,
    requestMagicLink,
    signOut,
    updateProfilePreferences,
    toggleContactField
  } = useAppState();
  const [email, setEmail] = useState(currentUser.email ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const roleLink =
    currentUser.appRole === "attendee" ? null : roleDestinations[currentUser.appRole];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage(null);

    try {
      await requestMagicLink(email);
      setStatusMessage(
        `Magic link sent to ${email}. Open it on this device and your profile will sync automatically.`
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Sign-in failed.");
    }
  }

  async function handleSignOut() {
    setStatusMessage(null);

    try {
      await signOut();
      setStatusMessage("Signed out. Guest mode still works.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Sign-out failed.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Profile</p>
            <h1 className="mt-3 font-display text-4xl font-semibold">{currentUser.name}</h1>
            <p className="mt-2 text-sm leading-6 text-white/72">
              Privacy-first attendee identity with live auth seam. Ticket card stays placeholder-only in v1.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Access</p>
            <p className="mt-2 font-display text-xl font-semibold text-gold">
              {currentUser.appRole}
            </p>
            <p className="mt-1 text-sm text-white/68">
              {auth.status === "authenticated" ? auth.email : "Guest mode"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
        <article className="space-y-4 rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-coral">Identity</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-midnight text-white">
                {currentUser.avatar}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-midnight">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-midnight/64">
                  {currentUser.role} · {currentUser.company}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-midnight/72">{currentUser.bio}</p>
          </div>

          <div className="rounded-[24px] bg-mist p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-midnight/50">Auth status</p>
            <p className="mt-2 font-display text-xl font-semibold text-midnight">
              {auth.status === "authenticated" ? "Signed in" : "Guest mode"}
            </p>
            <p className="mt-2 text-sm text-midnight/64">
              {isSupabaseEnabled
                ? "Magic-link auth is wired to Supabase. Once your tables are live, your week and privacy settings follow your account."
                : "Supabase keys are missing, so app stays in local guest mode."}
            </p>
          </div>

          {roleLink ? (
            <Link
              href={roleLink.href}
              className="flex items-center justify-between rounded-[24px] border border-midnight/10 px-4 py-4 transition hover:border-midnight/20 hover:bg-mist"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-coral">Role surface</p>
                <p className="mt-2 font-display text-xl font-semibold text-midnight">
                  {roleLink.label}
                </p>
              </div>
              <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
                Open
              </span>
            </Link>
          ) : null}

          <Link
            href="/app/submit"
            className="flex items-center justify-between rounded-[24px] border border-midnight/10 px-4 py-4 transition hover:border-midnight/20 hover:bg-mist"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Submission</p>
              <p className="mt-2 font-display text-xl font-semibold text-midnight">
                Submit a session
              </p>
            </div>
              <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
                Open
              </span>
          </Link>

          <Link
            href="/app/hub"
            className="flex items-center justify-between rounded-[24px] border border-midnight/10 px-4 py-4 transition hover:border-midnight/20 hover:bg-mist"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Route directory</p>
              <p className="mt-2 font-display text-xl font-semibold text-midnight">App map</p>
            </div>
            <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
              Open
            </span>
          </Link>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/app/updates"
              className="flex items-center justify-between rounded-[24px] border border-midnight/10 px-4 py-4 transition hover:border-midnight/20 hover:bg-mist"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-coral">Updates</p>
                <p className="mt-2 font-display text-xl font-semibold text-midnight">
                  Change feed
                </p>
              </div>
              <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
                Open
              </span>
            </Link>

            <Link
              href="/app/ticket"
              className="flex items-center justify-between rounded-[24px] border border-midnight/10 px-4 py-4 transition hover:border-midnight/20 hover:bg-mist"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-coral">Ticketing</p>
                <p className="mt-2 font-display text-xl font-semibold text-midnight">
                  Eventbrite handoff
                </p>
              </div>
              <span className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white">
                Open
              </span>
            </Link>
          </div>
        </article>

        <article className="space-y-4 rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-coral">Access controls</p>
            <div className="mt-4 rounded-[24px] border border-midnight/8 bg-[linear-gradient(180deg,#f9f7f0,#f2efe6)] p-4">
              <p className="font-display text-xl font-semibold text-midnight">
                {auth.status === "authenticated" ? "Account linked" : "Claim this profile"}
              </p>
              <p className="mt-2 text-sm text-midnight/64">
                Use email magic link first. This keeps native app flow simple when we wrap with Capacitor.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 rounded-2xl border border-midnight/10 bg-white px-4 py-3 text-sm text-midnight outline-none transition focus:border-midnight/25"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#132b5b]"
                >
                  Send magic link
                </button>
              </form>
              {auth.status === "authenticated" ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="mt-3 rounded-2xl border border-midnight/12 px-4 py-3 text-sm font-semibold text-midnight transition hover:bg-mist"
                >
                  Sign out
                </button>
              ) : null}
              {statusMessage ? (
                <p className="mt-3 text-sm text-midnight/72">{statusMessage}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-[22px] bg-mist px-4 py-4">
            <div>
              <p className="font-display text-xl font-semibold text-midnight">Discoverable</p>
              <p className="text-sm text-midnight/64">
                Control whether Connect directory can show your profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                updateProfilePreferences({ isDiscoverable: !currentUser.isDiscoverable })
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                currentUser.isDiscoverable
                  ? "bg-midnight text-white"
                  : "bg-white text-midnight"
              }`}
            >
              {currentUser.isDiscoverable ? "Visible" : "Hidden"}
            </button>
          </div>

          <div className="grid gap-3">
            {fields.map((field) => {
              const active = currentUser.visibleContactFields.includes(field);
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleContactField(field)}
                  className="flex items-center justify-between rounded-[22px] border border-midnight/8 px-4 py-4 text-left"
                >
                  <div>
                    <p className="font-semibold capitalize text-midnight">{field}</p>
                    <p className="text-sm text-midnight/64">
                      {currentUser.contactLinks[field] ?? "Not set"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      active
                        ? "bg-[rgba(245,200,66,0.2)] text-midnight"
                        : "bg-mist text-midnight/56"
                    }`}
                  >
                    {active ? "Shared" : "Private"}
                  </span>
                </button>
              );
            })}
          </div>

          {currentUser.appRole !== "sponsor" && currentUser.appRole !== "admin" ? (
            <div className="rounded-[22px] border border-midnight/8 px-4 py-4">
              <div>
                <p className="font-display text-xl font-semibold text-midnight">Interests</p>
                <p className="text-sm text-midnight/64">
                  Used to shape `Suggested for you` and keep recommendations relevant.
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const active = currentUser.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        updateProfilePreferences({
                          interests: active
                            ? currentUser.interests.filter((value) => value !== interest)
                            : [...currentUser.interests, interest]
                        })
                      }
                      className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${
                        active
                          ? "bg-midnight text-white"
                          : "bg-mist text-midnight/68"
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-[22px] border border-dashed border-midnight/14 bg-[rgba(10,24,56,0.03)] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-midnight/48">Ticket placeholder</p>
            <p className="mt-2 font-display text-xl font-semibold text-midnight">
              Eventbrite sync comes later.
            </p>
            <p className="mt-2 text-sm text-midnight/64">
              Badge surface stays visual-only until ticket validation phase.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
