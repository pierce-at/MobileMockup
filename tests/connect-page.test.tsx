import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ConnectPage from "@/app/app/connect/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("ConnectPage", () => {
  it("shows only discoverable attendees", async () => {
    renderWithAppState(<ConnectPage />);

    expect(await screen.findByText("Maya Brooks")).toBeInTheDocument();
    expect(screen.getByText("Eden Cho")).toBeInTheDocument();
    expect(screen.queryByText("Dylan Hart")).not.toBeInTheDocument();
  });

  it("filters by role", async () => {
    renderWithAppState(<ConnectPage />);

    const [roleSelect] = await screen.findAllByDisplayValue("All");
    fireEvent.change(roleSelect, { target: { value: "GP" } });

    expect(await screen.findByText("Eden Cho")).toBeInTheDocument();
    expect(screen.queryByText("Maya Brooks")).not.toBeInTheDocument();
  });
});
