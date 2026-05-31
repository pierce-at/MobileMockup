"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { INTEREST_OPTIONS } from "@/lib/domain/interests";
import type { AppRole, InterestTag } from "@/lib/domain/types";
import {
  readOnboardingState,
  writeOnboardingSkipFlag,
  writeOnboardingState
} from "@/lib/onboarding/storage";
import { useAppState } from "@/lib/state/app-state";

function roleTitle(role: AppRole) {
  switch (role) {
    case "attendee":
      return "Attendee setup";
    case "sponsor":
      return "Sponsor setup";
    case "speaker":
      return "Speaker setup";
    case "host":
      return "Host setup";
    case "admin":
      return "Admin setup";
  }
}

export function InterestOnboarding() {
  const {
    auth,
    availableProfiles,
    clearPreviewProfile,
    currentUser,
    isPreviewing,
    previewProfileId,
    savedSchedule,
    setPreviewProfile,
    updateProfilePreferences
  } = useAppState();
  const [selected, setSelected] = useState<InterestTag[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const storageProfileKey = previewProfileId ?? currentUser.id;
  const roleProfiles = useMemo(
    () =>
      (["attendee", "speaker", "sponsor", "host", "admin"] as AppRole[]).map((role) => ({
        role,
        profile: availableProfiles.find((profile) => profile.appRole === role)
      })),
    [availableProfiles]
  );

  useEffect(() => {
    setSelected(currentUser.interests);
  }, [currentUser.interests]);

  const attendeeSteps = [
    {
      id: "account",
      label: "Link account",
      done: auth.status === "authenticated",
      note:
        auth.status === "authenticated"
          ? auth.email ?? "Signed in"
          : "Magic-link sign-in keeps your schedule and settings attached to you."
    },
    {
      id: "interests",
      label: "Pick interests",
      done: currentUser.interests.length > 0 || selected.length > 0,
      note:
        currentUser.interests.length > 0 || selected.length > 0
          ? `${(currentUser.interests.length > 0 ? currentUser.interests : selected).length} selected`
          : "This powers Suggested for you."
    },
    {
      id: "schedule",
      label: "Save first session",
      done: savedSchedule.length > 0,
      note:
        savedSchedule.length > 0
          ? `${savedSchedule.length} saved so far`
          : "Build your own week so schedule, map, and updates feel personal."
    }
  ];

  const roleSteps: Record<AppRole, Array<{ id: string; label: string; done: boolean; note: string }>> = {
    attendee: attendeeSteps,
    sponsor: [
      {
        id: "identity",
        label: "Confirm sponsor view",
        done: isPreviewing || currentUser.appRole === "sponsor",
        note: "Use preview mode or linked sponsor account to review partner surfaces."
      },
      {
        id: "profile",
        label: "Review sponsor page",
        done: true,
        note: "Check headline, links, featured sessions, and outbound CTAs."
      },
      {
        id: "team",
        label: "Check team + leads",
        done: true,
        note: "Make sure team access, lead capture, and fulfillment feel demo-ready."
      }
    ],
    speaker: [
      {
        id: "identity",
        label: "Confirm speaker access",
        done: isPreviewing || currentUser.appRole === "speaker",
        note: "Use preview mode or linked speaker account to inspect owned sessions."
      },
      {
        id: "session",
        label: "Review session details",
        done: true,
        note: "Confirm title, abstract, timing, room, and speaker card before publish."
      },
      {
        id: "logistics",
        label: "Prep logistics",
        done: true,
        note: "Add materials, mic needs, AV notes, and day-of handoff details."
      }
    ],
    host: [
      {
        id: "identity",
        label: "Confirm host access",
        done: isPreviewing || currentUser.appRole === "host",
        note: "Use preview mode or linked host account to inspect owned sessions."
      },
      {
        id: "copy",
        label: "Review session copy",
        done: true,
        note: "Tighten session title, description, and speaker info."
      },
      {
        id: "materials",
        label: "Add materials",
        done: true,
        note: "Upload links and verify logistics before ops locks schedule edits."
      }
    ],
    admin: [
      {
        id: "identity",
        label: "Confirm admin access",
        done: isPreviewing || currentUser.appRole === "admin",
        note: "Use preview mode or linked admin account to inspect review tools."
      },
      {
        id: "queue",
        label: "Review submissions",
        done: true,
        note: "Check approval pipeline, linked draft sessions, and review notes."
      },
      {
        id: "publish",
        label: "Check publish controls",
        done: true,
        note: "Verify release lock, volunteer coverage, and workstream readiness."
      }
    ]
  };

  const setupLinks: Record<AppRole, Array<{ href: string; label: string }>> = {
    attendee: [
      { href: "/app/profile", label: auth.status === "authenticated" ? "Open profile" : "Link account" },
      { href: "/app/schedule", label: "Save first session" }
    ],
    sponsor: [
      { href: "/app/sponsor", label: "Open sponsor overview" },
      { href: "/app/sponsor/edit", label: "Edit sponsor page" }
    ],
    speaker: [
      { href: "/app/workspace", label: "Open speaker desk" },
      { href: "/app/schedule", label: "Review public schedule" }
    ],
    host: [
      { href: "/app/workspace", label: "Open host workspace" },
      { href: "/app/schedule", label: "Review public schedule" }
    ],
    admin: [
      { href: "/app/admin", label: "Open admin console" },
      { href: "/app/volunteer", label: "Check volunteer desk" }
    ]
  };

  const steps = roleSteps[currentUser.appRole];
  const completedCount = steps.filter((step) => step.done).length;
  const isComplete = completedCount === steps.length;

  useEffect(() => {
    const nextState = readOnboardingState();
    nextState[storageProfileKey] = {
      ...nextState[storageProfileKey],
      completedAt: isComplete ? new Date().toISOString() : undefined
    };
    writeOnboardingState(nextState);
  }, [isComplete, storageProfileKey]);

  const toggleInterest = (interest: InterestTag) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (
      currentUser.appRole === "attendee" &&
      selected.length &&
      selected.join("|") !== currentUser.interests.join("|")
    ) {
      await updateProfilePreferences({ interests: selected });
    }

    const nextState = readOnboardingState();
    nextState[storageProfileKey] = {
      ...nextState[storageProfileKey],
      snoozedAt: undefined
    };
    writeOnboardingState(nextState);
    writeOnboardingSkipFlag(false);
    setIsSaving(false);
  };

  const handleSnooze = () => {
    const nextState = readOnboardingState();
    nextState[storageProfileKey] = {
      ...nextState[storageProfileKey],
      snoozedAt: new Date().toISOString()
    };
    writeOnboardingState(nextState);
    writeOnboardingSkipFlag(true);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[18px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">{roleTitle(currentUser.appRole)}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Get this view ready in a minute.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
          Switch roles, finish first-run tasks, and keep demo flows easy to revisit while auth and validation are still growing in.
        </p>
      </div>

      <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
        <div className="rounded-[12px] border border-midnight/8 bg-[linear-gradient(180deg,#f9f7f0,#f2efe6)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                Explore as
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-midnight">
                {currentUser.name} - {currentUser.appRole}
              </p>
            </div>
            {isPreviewing ? (
              <button
                type="button"
                onClick={clearPreviewProfile}
                className="rounded-full border border-midnight/10 px-3 py-2 text-[12px] font-semibold text-midnight"
              >
                Back to live account
              </button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {roleProfiles.map(({ role, profile }) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  if (!profile) return;
                  setPreviewProfile(profile.id);
                }}
                className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${
                  currentUser.appRole === role
                    ? "bg-midnight text-white"
                    : "border border-midnight/10 bg-white text-midnight/70"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-[10px] border px-3 py-3 ${
                step.done ? "border-[#358f5f]/18 bg-[#edf7f0]" : "border-midnight/8 bg-mist"
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-midnight/46">
                {step.label}
              </p>
              <p className="mt-2 text-sm font-semibold text-midnight">
                {step.done ? "Ready" : "Still open"}
              </p>
              <p className="mt-1 text-xs leading-5 text-midnight/64">{step.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[10px] bg-[linear-gradient(180deg,#f9f7f0,#f2efe6)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
                Progress
              </p>
              <p className="mt-1 font-display text-xl font-semibold text-midnight">
                {completedCount} of {steps.length} done
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-midnight/70">
              {isComplete ? "Ready" : auth.status === "authenticated" ? "Linked" : "Guest mode"}
            </span>
          </div>
        </div>

        {currentUser.appRole === "attendee" ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const active = selected.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-full px-3 py-2 text-[12px] font-semibold transition ${
                    active
                      ? "bg-midnight text-white"
                      : "border border-midnight/10 bg-mist text-midnight/70"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-[12px] border border-dashed border-midnight/12 bg-[rgba(12,73,90,0.03)] px-4 py-4 text-sm leading-6 text-midnight/68">
            {currentUser.appRole === "sponsor"
              ? "Sponsor onboarding should focus on page quality, reach surfaces, team access, and lead clarity."
              : currentUser.appRole === "speaker"
                ? "Speaker onboarding should focus on session accuracy, stage materials, and logistics questions that ops needs before schedule lock."
              : currentUser.appRole === "host"
                ? "Host onboarding should focus on session accuracy, materials, and day-of logistics handoff."
                : "Admin onboarding should focus on review queue, publish state, volunteer coverage, and operations readiness."}
          </div>
        )}

        <div className="mt-5 grid gap-3 rounded-[12px] border border-midnight/8 bg-white/80 p-4 sm:grid-cols-2">
          {setupLinks[currentUser.appRole].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[16px] border border-midnight/10 px-4 py-3 text-center text-sm font-semibold text-midnight transition hover:bg-mist"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <Link
            href="/app/hub"
            onClick={handleSnooze}
            className="rounded-[16px] border border-midnight/10 px-4 py-3 text-center text-sm font-semibold text-midnight/64"
          >
            Come back later
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/app/schedule"
              onClick={() => writeOnboardingSkipFlag(true)}
              className="rounded-[16px] border border-midnight/10 px-4 py-3 text-center text-sm font-semibold text-midnight/64"
            >
              Skip for testing
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving}
              className="rounded-[16px] bg-midnight px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save setup"}
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
