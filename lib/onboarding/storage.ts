const ONBOARDING_STORAGE_KEY = "tcsw-onboarding-state-v1";
const ONBOARDING_SKIP_KEY = "tcsw-onboarding-skip-v1";

export type OnboardingEntry = {
  completedAt?: string;
  snoozedAt?: string;
};

export type OnboardingMap = Record<string, OnboardingEntry>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readOnboardingState(): OnboardingMap {
  if (!canUseStorage()) return {};

  const rawValue = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!rawValue) return {};

  try {
    return JSON.parse(rawValue) as OnboardingMap;
  } catch {
    return {};
  }
}

export function writeOnboardingState(nextState: OnboardingMap) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(nextState));
}

export function hasAnyCompletedOnboarding() {
  return Object.values(readOnboardingState()).some((entry) => Boolean(entry.completedAt));
}

export function readOnboardingSkipFlag() {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(ONBOARDING_SKIP_KEY) === "1";
}

export function writeOnboardingSkipFlag(value: boolean) {
  if (!canUseStorage()) return;

  if (value) {
    window.localStorage.setItem(ONBOARDING_SKIP_KEY, "1");
    return;
  }

  window.localStorage.removeItem(ONBOARDING_SKIP_KEY);
}
