"use client";

import { clsx } from "clsx";

import type { DayKey } from "@/lib/domain/types";
import { DAY_LABELS } from "@/lib/utils/time";

type DaySwitcherProps = {
  activeDay: DayKey;
  onChange: (day: DayKey) => void;
};

export function DaySwitcher({ activeDay, onChange }: DaySwitcherProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {(Object.keys(DAY_LABELS) as DayKey[]).map((day) => (
        <button
          key={day}
          type="button"
          onClick={() => onChange(day)}
          className={clsx(
            "rounded-full border px-4 py-2 text-sm transition",
            activeDay === day
              ? "border-midnight bg-midnight text-white"
              : "border-midnight/10 bg-white text-midnight/72 hover:border-midnight/20"
          )}
        >
          {DAY_LABELS[day]}
        </button>
      ))}
    </div>
  );
}
