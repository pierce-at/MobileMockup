import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InterestOnboarding } from "@/components/interest-onboarding";
import { renderWithAppState } from "@/tests/test-utils";

describe("InterestOnboarding", () => {
  it("shows broader attendee setup for guest users", async () => {
    renderWithAppState(<InterestOnboarding />);

    expect(await screen.findByText("Get this view ready in a minute.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Link account" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Save first session" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save setup" }));

    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
  });
});
