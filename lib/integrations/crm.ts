import { integrationConfig } from "@/lib/integrations/config";

export function getCrmIntegrationStatus() {
  return {
    provider: integrationConfig.crmProvider ?? "placeholder",
    isConfigured: Boolean(integrationConfig.crmProvider),
    nextStep: "Connect sponsor leads, registration attribution, and outbound follow-up."
  };
}
