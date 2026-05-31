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
    <div className="grid w-full grid-cols-5 gap-[6px] pb-1 sm:gap-2">
      {(Object.keys(DAY_LABELS) as DayKey[]).map((day) => {
        const [weekday, date] = DAY_LABELS[day].split(" ");
        const dayNumber = date?.split("/")[1] ?? date;
        const active = activeDay === day;

        return (
          <button
            key={day}
            type="button"
            onClick={() => onChange(day)}
            className={clsx(
              "min-h-[54px] rounded-full px-2 py-2 text-center transition sm:min-h-[60px] sm:px-4",
              active ? "bg-midnight" : "bg-[#f4f5fa] hover:bg-white"
            )}
          >
            <span
              className={clsx(
                "block text-[8px] font-bold uppercase tracking-[0.1em] sm:text-[9px]",
                active ? "text-gold" : "text-[var(--color-muted)]"
              )}
            >
              {weekday}
            </span>
            <span
              className={clsx(
                "block text-[15px] font-extrabold leading-tight sm:text-[18px]",
                active ? "text-white" : "text-ink"
              )}
            >
              {dayNumber}
            </span>
          </button>
        );
      })}
    </div>
  );
}
