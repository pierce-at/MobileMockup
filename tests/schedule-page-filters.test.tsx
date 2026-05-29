import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SchedulePage from "@/app/app/schedule/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("SchedulePage filters", () => {
  it("filters the list by search and saved only", async () => {
    renderWithAppState(<SchedulePage />);

    const search = await screen.findByPlaceholderText("Search sessions, speakers, tags");
    fireEvent.change(search, { target: { value: "Banking" } });

    expect(await screen.findByText("Banking the Next 10M")).toBeInTheDocument();
    expect(screen.queryByText("Investor Roundtable: Midwest AI")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Saved only" }));
    expect(await screen.findByText("Nothing matches those filters.")).toBeInTheDocument();
  });
});
