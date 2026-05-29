import { describe, expect, it } from "vitest";

import { mockRepository } from "@/lib/data/repository";

describe("submission review flow", () => {
  it("creates a linked draft session when a submission is approved", async () => {
    const approved = await mockRepository.updateSubmissionReview("submission-northloop", {
      status: "approved",
      internalNotes: "Approved for a draft slot.",
      decisionNote: "Move this into hardware programming.",
      assignedReviewer: "Avery Cole"
    });

    expect(approved.status).toBe("approved");
    expect(approved.linkedSessionId).toBeTruthy();
    expect(approved.lastReviewedAt).toBeTruthy();

    const sessions = await mockRepository.getSessions();
    const created = sessions.find((session) => session.id === approved.linkedSessionId);

    expect(created).toBeTruthy();
    expect(created?.sourceSubmissionId).toBe("submission-northloop");
    expect(created?.ownerProfileId).toBe("attendee-dylan");
    expect(created?.title).toBe("Warehouse Robotics Without the Hype");
  });
});
