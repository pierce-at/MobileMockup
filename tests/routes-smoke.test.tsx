import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CommunityPage from "@/app/app/community/page";
import MapPage from "@/app/app/map/page";
import MySchedulePage from "@/app/app/my-schedule/page";
import OnboardingPage from "@/app/app/onboarding/page";
import SchedulePage from "@/app/app/schedule/page";
import SubmitPage from "@/app/app/submit/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("attendee route smoke", () => {
  it("renders core attendee screens", async () => {
    const pages = [
      { ui: <SchedulePage />, title: "Browse the schedule" },
      { ui: <MySchedulePage />, title: "My saved week" },
      { ui: <MapPage />, title: "Event map" },
      { ui: <CommunityPage />, title: "Ecosystem behind week." },
      { ui: <OnboardingPage />, title: "Get this view ready in a minute." },
      { ui: <SubmitPage />, title: "Bring a real session into the week." }
    ];

    for (const page of pages) {
      const { unmount } = renderWithAppState(page.ui);
      expect(
        await screen.findByRole("heading", { name: page.title })
      ).toBeInTheDocument();
      unmount();
    }
  });
});
