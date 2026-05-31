function sanitizeEnvValue(value: string | undefined) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("replace_me")) return null;

  return trimmed;
}

export const integrationConfig = {
  eventbriteEventUrl: sanitizeEnvValue(process.env.NEXT_PUBLIC_EVENTBRITE_EVENT_URL),
  eventbriteOrganizerUrl: sanitizeEnvValue(process.env.NEXT_PUBLIC_EVENTBRITE_ORGANIZER_URL),
  supportEmail:
    sanitizeEnvValue(process.env.NEXT_PUBLIC_TCSW_SUPPORT_EMAIL) ?? "hello@beta.mn",
  emailProvider: sanitizeEnvValue(process.env.NEXT_PUBLIC_INTEGRATION_EMAIL_PROVIDER),
  crmProvider: sanitizeEnvValue(process.env.NEXT_PUBLIC_INTEGRATION_CRM_PROVIDER),
  volunteerProvider: sanitizeEnvValue(process.env.NEXT_PUBLIC_INTEGRATION_VOLUNTEER_PROVIDER),
  analyticsProvider: sanitizeEnvValue(process.env.NEXT_PUBLIC_INTEGRATION_ANALYTICS_PROVIDER)
};
