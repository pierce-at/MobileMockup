import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SchedulePage from "@/app/app/schedule/page";
import { defaultAppState } from "@/lib/data/mock-data";
import { AppStateProvider } from "@/lib/state/app-state";

const repositoryMock = vi.hoisted(() => ({
  getAppState: vi.fn(),
  saveSession: vi.fn(),
  removeSavedSession: vi.fn(),
  replaceSavedSchedule: vi.fn(),
  logSessionEvent: vi.fn()
}));

vi.mock("@/lib/data/repository", () => ({
  getRepository: () => repositoryMock
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseBrowserClient: () => null
}));

vi.mock("@/lib/supabase/config", () => ({
  hasSupabaseConfig: () => false
}));

vi.mock("@/lib/supabase/auth", () => ({
  signInWithMagicLink: vi.fn(),
  signOutFromSupabase: vi.fn()
}));

function Providers({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>;
}

describe("AppStateProvider save actions", () => {
  beforeEach(() => {
    repositoryMock.getAppState.mockResolvedValue({
      ...defaultAppState,
      savedSchedule: []
    });
    repositoryMock.saveSession.mockResolvedValue([
      { sessionId: "session-fintech", savedAt: "2026-05-28T12:00:00.000Z" },
      { sessionId: "session-investor", savedAt: "2026-05-28T12:01:00.000Z" },
      { sessionId: "session-health-ai", savedAt: "2026-05-28T12:02:00.000Z" },
      { sessionId: "session-demo-night", savedAt: "2026-05-28T12:03:00.000Z" }
    ]);
    repositoryMock.removeSavedSession.mockResolvedValue([]);
    repositoryMock.replaceSavedSchedule.mockResolvedValue([]);
    repositoryMock.logSessionEvent.mockResolvedValue(undefined);
  });

  it("adds only the clicked session even if the repository returns a wider schedule", async () => {
    render(<SchedulePage />, { wrapper: Providers });

    await screen.findByRole("heading", { name: "Browse the schedule" });

    fireEvent.click(screen.getByTestId("save-toggle-session-investor"));

    await waitFor(() => {
      expect(screen.getByTestId("save-toggle-session-investor")).toHaveAttribute("aria-label", "Saved");
    });

    expect(screen.getByTestId("save-toggle-session-fintech")).toHaveAttribute("aria-label", "Save");
    expect(screen.getByTestId("save-toggle-session-health-ai")).toHaveAttribute("aria-label", "Save");
    expect(screen.getByTestId("save-toggle-session-demo-night")).toHaveAttribute("aria-label", "Save");
    expect(repositoryMock.replaceSavedSchedule).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ sessionId: "session-investor" })
      ]),
      "attendee-maya"
    );
  });
});
