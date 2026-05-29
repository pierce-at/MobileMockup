import { describe, expect, it } from "vitest";

import { defaultAppState } from "@/lib/data/mock-data";
import { getRecommendedSessions } from "@/lib/utils/recommendations";

describe("getRecommendedSessions", () => {
  it("returns related unsaved sessions based on saved tags", () => {
    const savedSchedule = [
      { sessionId: "session-fintech", savedAt: "2026-05-28T12:00:00.000Z" },
      { sessionId: "session-investor", savedAt: "2026-05-28T12:01:00.000Z" }
    ];
    const recommendations = getRecommendedSessions(
      defaultAppState.sessions,
      savedSchedule,
      [],
      3
    );

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every((session) => !["session-fintech", "session-investor"].includes(session.id))).toBe(true);
  });

  it("uses declared interests when there is no saved schedule yet", () => {
    const recommendations = getRecommendedSessions(
      defaultAppState.sessions,
      [],
      ["Operations", "Systems"],
      3
    );

    expect(recommendations.some((session) => session.id === "session-ops")).toBe(true);
  });
});
