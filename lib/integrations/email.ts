import { integrationConfig } from "@/lib/integrations/config";

export function getEmailIntegrationStatus() {
  return {
    provider: integrationConfig.emailProvider ?? "placeholder",
    isConfigured: Boolean(integrationConfig.emailProvider),
    supportEmail: integrationConfig.supportEmail,
    nextStep: "Connect speaker reminders, approval notices, and schedule-change sends."
  };
}
