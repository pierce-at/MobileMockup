import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import SchedulePage from "@/app/app/schedule/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("SchedulePage save interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves only the tapped session when clicking a later card first", async () => {
    renderWithAppState(<SchedulePage />);

    expect(
      await screen.findByRole("heading", { name: "Browse the schedule" })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("save-toggle-session-health-ai"));

    await waitFor(() => {
      expect(screen.getByTestId("save-toggle-session-health-ai")).toHaveAttribute("aria-label", "Saved");
    });

    expect(screen.getByTestId("save-toggle-session-fintech")).toHaveAttribute("aria-label", "Save");
    expect(screen.getByTestId("save-toggle-session-investor")).toHaveAttribute("aria-label", "Save");
    expect(screen.getByTestId("save-toggle-session-demo-night")).toHaveAttribute("aria-label", "Save");
  });

  it("keeps save state scoped to each visible session on the selected day", async () => {
    renderWithAppState(<SchedulePage />);

    await screen.findByRole("heading", { name: "Browse the schedule" });
    await screen.findByTestId("save-toggle-session-investor");

    const wedSessionIds = [
      "session-fintech",
      "session-investor",
      "session-health-ai",
      "session-demo-night"
    ];

    fireEvent.click(screen.getByTestId("save-toggle-session-investor"));

    await waitFor(() => {
      expect(screen.getByTestId("save-toggle-session-investor")).toHaveAttribute("aria-label", "Saved");
    });

    wedSessionIds
      .filter((sessionId) => sessionId !== "session-investor")
      .forEach((sessionId) => {
        expect(screen.getByTestId(`save-toggle-${sessionId}`)).toHaveAttribute("aria-label", "Save");
      });
  });
});
