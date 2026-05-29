import { beforeEach, describe, expect, it } from "vitest";

import { mockRepository } from "@/lib/data/repository";

describe("saved schedule state", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts empty for guest mode and only saves the selected session", async () => {
    expect(await mockRepository.getSavedSchedule()).toEqual([]);

    const afterFirstSave = await mockRepository.saveSession("session-fintech");
    expect(afterFirstSave).toHaveLength(1);
    expect(afterFirstSave[0]?.sessionId).toBe("session-fintech");

    const afterSecondSave = await mockRepository.saveSession("session-ops");
    expect(afterSecondSave.map((entry) => entry.sessionId)).toEqual([
      "session-fintech",
      "session-ops"
    ]);

    const afterRemove = await mockRepository.removeSavedSession("session-fintech");
    expect(afterRemove.map((entry) => entry.sessionId)).toEqual(["session-ops"]);
  });
});
