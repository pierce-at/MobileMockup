import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProfilePage from "@/app/app/profile/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("ProfilePage", () => {
  it("toggles discoverability and contact sharing", async () => {
    renderWithAppState(<ProfilePage />);

    const visibleButton = await screen.findByRole("button", { name: "Visible" });
    fireEvent.click(visibleButton);
    expect(await screen.findByRole("button", { name: "Hidden" })).toBeInTheDocument();

    const linkedInToggle = screen.getByRole("button", { name: /linkedin/i });
    fireEvent.click(linkedInToggle);
    expect(await screen.findByText("Private")).toBeInTheDocument();
  });
});
