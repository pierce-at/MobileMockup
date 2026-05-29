import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SessionCard } from "@/components/session-card";
import { defaultAppState } from "@/lib/data/mock-data";

describe("SessionCard", () => {
  it("renders sponsored and overlap badges", () => {
    const session = defaultAppState.sessions[0];
    const sponsor = defaultAppState.sponsors[0];
    const venue = defaultAppState.venues[0];

    render(
      <SessionCard
        session={session}
        sponsor={sponsor}
        venue={venue}
        isSaved={true}
        isConflicting={true}
        isUpdated={true}
        onToggleSave={vi.fn()}
      />
    );

    expect(screen.getByText(/Sponsored/i)).toBeInTheDocument();
    expect(screen.getByText(/Overlap/i)).toBeInTheDocument();
    expect(screen.getByText(/Updated/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Saved" })).toBeInTheDocument();
  });
});
