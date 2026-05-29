"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { INTEREST_OPTIONS } from "@/lib/domain/interests";
import type { InterestTag } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

export function InterestOnboarding() {
  const { currentUser, isReady, updateProfilePreferences } = useAppState();
  const pathname = usePathname();
  const [selected, setSelected] = useState<InterestTag[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hideForRoute =
    pathname?.startsWith("/app/sponsor") || pathname?.startsWith("/app/admin");

  useEffect(() => {
    setSelected(currentUser.interests);
  }, [currentUser.interests]);

  if (
    !isReady ||
    dismissed ||
    hideForRoute ||
    currentUser.appRole !== "attendee" ||
    currentUser.interests.length > 0
  ) {
    return null;
  }

  const toggleInterest = (interest: InterestTag) => {
    setSelected((current) =>
      current.includes(interest)
        ? current.filter((value) => value !== interest)
        : [...current, interest]
    );
  };

  const handleContinue = async () => {
    if (!selected.length) return;
    setIsSaving(true);
    await updateProfilePreferences({ interests: selected });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-midnight/30 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-[560px] rounded-[30px] border border-white/12 bg-white p-5 shadow-card">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
          Quick onboarding
        </p>
        <h2 className="mt-2 font-display text-[28px] font-semibold text-midnight">
          What do you want more of this week?
        </h2>
        <p className="mt-2 text-sm leading-6 text-midnight/68">
          Pick a few interests so `Suggested for you` can actually be useful.
        </p>

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

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-[16px] border border-midnight/10 px-4 py-3 text-sm font-semibold text-midnight/64"
          >
            Later
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected.length || isSaving}
            className="rounded-[16px] bg-midnight px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save interests"}
          </button>
        </div>
      </div>
    </div>
  );
}
