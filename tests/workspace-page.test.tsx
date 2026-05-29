import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WorkspacePage from "@/app/app/workspace/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("WorkspacePage", () => {
  it("renders owned session editing surface", async () => {
    renderWithAppState(<WorkspacePage />);

    expect(await screen.findByRole("heading", { name: "Session owner desk" })).toBeInTheDocument();
    expect(screen.getByText("Banking the Next 10M")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Logistics notes"), {
      target: { value: "Updated logistics note" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save workspace changes" }));

    expect(await screen.findByText("Session workspace updated.")).toBeInTheDocument();
    expect(screen.getByText("Speaker card editor")).toBeInTheDocument();
  });
});
