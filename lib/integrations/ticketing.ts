import type { Session } from "@/lib/domain/types";
import { integrationConfig } from "@/lib/integrations/config";

const EVENTBRITE_FALLBACK_URL = "https://www.eventbrite.com/";

export function getDefaultTicketUrl() {
  return integrationConfig.eventbriteEventUrl ?? EVENTBRITE_FALLBACK_URL;
}

export function getSessionRegistrationUrl(
  session: Pick<Session, "externalRegistrationUrl"> | null | undefined
) {
  return session?.externalRegistrationUrl ?? getDefaultTicketUrl();
}

export function getTicketingIntegrationStatus() {
  return {
    provider: "Eventbrite",
    isConfigured: Boolean(integrationConfig.eventbriteEventUrl),
    eventUrl: integrationConfig.eventbriteEventUrl,
    organizerUrl: integrationConfig.eventbriteOrganizerUrl,
    supportEmail: integrationConfig.supportEmail
  };
}
