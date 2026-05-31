import { integrationConfig } from "@/lib/integrations/config";

export function getAnalyticsIntegrationStatus() {
  return {
    provider: integrationConfig.analyticsProvider ?? "placeholder",
    isConfigured: Boolean(integrationConfig.analyticsProvider),
    nextStep: "Connect sponsor reach, registration attribution, and route-level engagement tracking."
  };
}
