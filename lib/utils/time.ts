import type { DayKey, SavedScheduleEntry, Session } from "@/lib/domain/types";

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Mon 9/14",
  tue: "Tue 9/15",
  wed: "Wed 9/16",
  thu: "Thu 9/17",
  fri: "Fri 9/18"
};

export function sortSessionsByTime(sessions: Session[]) {
  return [...sessions].sort((left, right) => {
    const dayCompare = getDayIndex(left.day) - getDayIndex(right.day);
    if (dayCompare !== 0) return dayCompare;

    return toMinutes(left.startTime) - toMinutes(right.startTime);
  });
}

export function toMinutes(value: string) {
  const [time, meridiem] = value.split(" ");
  const [rawHour, rawMinute] = time.split(":").map(Number);
  let hour = rawHour % 12;
  if (meridiem === "PM") hour += 12;
  return hour * 60 + rawMinute;
}

export function sessionsOverlap(left: Session, right: Session) {
  if (left.day !== right.day) return false;
  return (
    toMinutes(left.startTime) < toMinutes(right.endTime) &&
    toMinutes(right.startTime) < toMinutes(left.endTime)
  );
}

export function getConflictingSessionIds(
  sessions: Session[],
  savedSchedule: SavedScheduleEntry[]
) {
  const savedIds = new Set(savedSchedule.map((entry) => entry.sessionId));
  const selectedSessions = sortSessionsByTime(
    sessions.filter((session) => savedIds.has(session.id))
  );
  const conflicts = new Set<string>();

  for (let index = 0; index < selectedSessions.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < selectedSessions.length; compareIndex += 1) {
      const left = selectedSessions[index];
      const right = selectedSessions[compareIndex];

      if (left.day !== right.day) break;
      if (sessionsOverlap(left, right)) {
        conflicts.add(left.id);
        conflicts.add(right.id);
      }
    }
  }

  return conflicts;
}

export function getDayIndex(day: DayKey) {
  return ["mon", "tue", "wed", "thu", "fri"].indexOf(day);
}
