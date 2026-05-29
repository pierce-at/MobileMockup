import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SponsorProfileScreen } from "@/components/sponsor-profile-screen";
import { renderWithAppState } from "@/tests/test-utils";

describe("SponsorProfileScreen", () => {
  it("renders sponsor links and featured sessions", async () => {
    renderWithAppState(<SponsorProfileScreen slug="us-bank" />);

    expect(await screen.findByRole("heading", { name: "U.S. Bank" })).toBeInTheDocument();
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Banking the Next 10M")).toBeInTheDocument();
  });
});
