import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAppState } from "@/lib/state/app-state";
import { renderWithAppState } from "@/tests/test-utils";

function PreviewHarness() {
  const { clearPreviewProfile, currentUser, setPreviewProfile } = useAppState();

  return (
    <div>
      <p>{currentUser.name}</p>
      <p>{currentUser.appRole}</p>
      <button type="button" onClick={() => setPreviewProfile("attendee-avery")}>
        Switch to admin
      </button>
      <button type="button" onClick={clearPreviewProfile}>
        Clear preview
      </button>
    </div>
  );
}

describe("AppState preview mode", () => {
  it("switches between seeded identities for demo review", async () => {
    renderWithAppState(<PreviewHarness />);

    expect(await screen.findByText("Maya Brooks")).toBeInTheDocument();
    expect(screen.getByText("attendee")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to admin" }));

    expect(await screen.findByText("Avery Cole")).toBeInTheDocument();
    expect(screen.getByText("admin")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear preview" }));

    expect(await screen.findByText("Maya Brooks")).toBeInTheDocument();
  });
});
