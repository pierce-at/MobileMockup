import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AdminPage from "@/app/app/admin/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("AdminPage", () => {
  it("renders review workflow and publish controls", async () => {
    renderWithAppState(<AdminPage />);

    expect(
      await screen.findByRole("heading", { name: "Editorial and publish control" })
    ).toBeInTheDocument();
    expect(screen.getByText(/reserved for admin reviewers/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unpublish schedule" })).toBeInTheDocument();
    expect(screen.getAllByText("Ops Playbooks for Post-Seed Teams").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Warehouse Robotics Without the Hype/i }));
    expect(screen.getByRole("button", { name: "Mark approved" })).toBeInTheDocument();
    expect(screen.getByLabelText("Internal notes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark approved" })).toBeDisabled();
  });
});
