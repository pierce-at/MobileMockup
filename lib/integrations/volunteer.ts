import { integrationConfig } from "@/lib/integrations/config";

export function getVolunteerIntegrationStatus() {
  return {
    provider: integrationConfig.volunteerProvider ?? "placeholder",
    isConfigured: Boolean(integrationConfig.volunteerProvider),
    nextStep: "Connect volunteer intake, assignment messaging, and day-of coverage updates."
  };
}
