import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SubmitPage from "@/app/app/submit/page";
import { renderWithAppState } from "@/tests/test-utils";

describe("SubmitPage", () => {
  it("creates a submission confirmation", async () => {
    renderWithAppState(<SubmitPage />);

    fireEvent.change(screen.getByLabelText("Session title"), {
      target: { value: "Operator Rituals That Survive Growth" }
    });
    fireEvent.change(screen.getByLabelText("Summary"), {
      target: { value: "A practical talk about team rituals that keep shipping sane." }
    });
    fireEvent.change(screen.getByLabelText("Full description"), {
      target: { value: "A longer working-session description with enough detail for review." }
    });
    fireEvent.change(screen.getByLabelText("Intended audience"), {
      target: { value: "Founders and operator leads." }
    });
    fireEvent.change(screen.getByLabelText("Themes / tags"), {
      target: { value: "Operations, Systems" }
    });
    fireEvent.change(screen.getByLabelText("Host / speaker details"), {
      target: { value: "Maya Brooks, Founder at Aurora Freight" }
    });
    fireEvent.change(screen.getByLabelText("Logistics needs"), {
      target: { value: "Projector and seated discussion layout." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit to review queue" }));

    expect(
      await screen.findByText(/Submission received: Operator Rituals That Survive Growth/i)
    ).toBeInTheDocument();
  });
});
