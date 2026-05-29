import { describe, expect, it } from "vitest";

import { defaultAppState } from "@/lib/data/mock-data";
import { getConflictingSessionIds } from "@/lib/utils/time";

describe("schedule conflicts", () => {
  it("flags overlapping saved sessions", () => {
    const savedSchedule = [
      { sessionId: "session-fintech", savedAt: "2026-05-28T12:00:00.000Z" },
      { sessionId: "session-investor", savedAt: "2026-05-28T12:01:00.000Z" }
    ];
    const conflicts = getConflictingSessionIds(
      defaultAppState.sessions,
      savedSchedule
    );

    expect(conflicts.has("session-fintech")).toBe(true);
    expect(conflicts.has("session-investor")).toBe(true);
    expect(conflicts.has("session-community")).toBe(false);
  });
});
