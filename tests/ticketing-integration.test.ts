import { describe, expect, it } from "vitest";

import { getDefaultTicketUrl, getSessionRegistrationUrl } from "@/lib/integrations";

describe("ticketing integration helpers", () => {
  it("falls back to Eventbrite when session link is missing", () => {
    expect(getSessionRegistrationUrl(undefined)).toBe(getDefaultTicketUrl());
  });

  it("prefers session-specific registration links", () => {
    expect(
      getSessionRegistrationUrl({
        externalRegistrationUrl: "https://www.eventbrite.com/e/custom-session"
      })
    ).toBe("https://www.eventbrite.com/e/custom-session");
  });
});
