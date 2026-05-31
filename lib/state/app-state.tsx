"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";

import { defaultAppState } from "@/lib/data/mock-data";
import { getRepository } from "@/lib/data/repository";
import type {
  AttachmentCreateInput,
  AppState,
  AttendeeProfile,
  AuthSummary,
  ContactField,
  ProfilePreferencesUpdate,
  ScheduleControl,
  Session,
  SessionSubmissionCreateInput,
  SessionWorkspaceUpdate,
  SessionSubmission,
  Speaker,
  SpeakerProfileUpdate,
  SubmissionReviewUpdate,
  SponsorAnalytics,
  SponsorEventType,
  SponsorProfileUpdate
} from "@/lib/domain/types";
import { signInWithMagicLink, signOutFromSupabase } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getConflictingSessionIds } from "@/lib/utils/time";

type AppStoreContextValue = AppState & {
  auth: AuthSummary;
  isReady: boolean;
  isSupabaseEnabled: boolean;
  previewProfileId: string | null;
  isPreviewing: boolean;
  availableProfiles: AttendeeProfile[];
  conflictingSessionIds: Set<string>;
  sponsorAnalytics: Record<string, SponsorAnalytics | undefined>;
  submissions: SessionSubmission[];
  scheduleControl: ScheduleControl;
  setPreviewProfile: (profileId: string | null) => void;
  clearPreviewProfile: () => void;
  createAttachment: (input: AttachmentCreateInput) => Promise<void>;
  deleteAttachment: (attachmentId: string) => Promise<void>;
  saveSession: (sessionId: string) => Promise<void>;
  removeSavedSession: (sessionId: string) => Promise<void>;
  updateProfilePreferences: (payload: ProfilePreferencesUpdate) => Promise<void>;
  updateSponsorProfile: (sponsorId: string, payload: SponsorProfileUpdate) => Promise<void>;
  updateSubmissionReview: (
    submissionId: string,
    payload: SubmissionReviewUpdate
  ) => Promise<void>;
  createSubmission: (input: SessionSubmissionCreateInput) => Promise<SessionSubmission>;
  updateScheduleControl: (payload: Partial<ScheduleControl>) => Promise<void>;
  getOwnedSessions: () => Session[];
  getOwnedSpeakers: () => Speaker[];
  updateSessionWorkspace: (
    sessionId: string,
    payload: SessionWorkspaceUpdate
  ) => Promise<void>;
  updateSpeakerProfile: (speakerId: string, payload: SpeakerProfileUpdate) => Promise<void>;
  loadSponsorAnalytics: (sponsorId: string) => Promise<void>;
  logSponsorEvent: (
    sponsorId: string,
    eventType: SponsorEventType,
    metadata?: Record<string, string>
  ) => Promise<void>;
  requestMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isSaved: (sessionId: string) => boolean;
  getSessionBySlug: (slug: string) => Session | undefined;
  getSponsorSessions: (sponsorId: string) => Session[];
  getDiscoverableProfiles: () => AttendeeProfile[];
  toggleContactField: (field: ContactField) => Promise<void>;
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);
const PREVIEW_PROFILE_STORAGE_KEY = "tcsw-preview-profile-id";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readPreviewProfileId() {
  if (!canUseStorage()) return null;

  window.localStorage.removeItem(PREVIEW_PROFILE_STORAGE_KEY);
  return null;
}

function writePreviewProfileId(_profileId: string | null) {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(PREVIEW_PROFILE_STORAGE_KEY);
}

function mergeProfiles(primary: AttendeeProfile[], fallback: AttendeeProfile[]) {
  const seen = new Set<string>();
  return [...primary, ...fallback].filter((profile) => {
    if (seen.has(profile.id)) return false;
    seen.add(profile.id);
    return true;
  });
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(defaultAppState);
  const stateRef = useRef(state);
  const [auth, setAuth] = useState<AuthSummary>({ status: "guest", email: null });
  const [authIdentity, setAuthIdentity] = useState<{ email: string | null; name: string | null }>({
    email: null,
    name: null
  });
  const [isReady, setIsReady] = useState(false);
  const [previewProfileId, setPreviewProfileId] = useState<string | null>(null);
  const [sponsorAnalytics, setSponsorAnalytics] = useState<Record<string, SponsorAnalytics | undefined>>({});
  const isSupabaseEnabled = hasSupabaseConfig();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let isMounted = true;
    const client = getSupabaseBrowserClient();

    if (!client) {
      setAuthIdentity({ email: null, name: null });
      return () => {
        isMounted = false;
      };
    }

    client.auth
      .getSession()
      .then(({ data }) => {
        const session = data.session;
        if (!isMounted) return;

        setAuthIdentity({
          email: session?.user.email ?? null,
          name: session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? null
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setAuthIdentity({ email: null, name: null });
      });

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setAuthIdentity({
        email: session?.user.email ?? null,
        name: session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? null
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setPreviewProfileId(readPreviewProfileId());
  }, []);

  useEffect(() => {
    let isMounted = true;
    const repository = getRepository();

    async function syncAppState() {
      const { email, name } = authIdentity;
      setIsReady(false);

      setAuth({
        status: email ? "authenticated" : "guest",
        email
      });

      if (email) {
        await repository.ensureProfileFromAuth({ email, name });
      }

      const baseState = await repository.getAppState(email);
      if (!isMounted) return;

      let nextState = baseState;
      if (previewProfileId) {
        const previewProfile =
          baseState.profiles.find((profile) => profile.id === previewProfileId) ??
          defaultAppState.profiles.find((profile) => profile.id === previewProfileId);

        if (previewProfile?.email && previewProfile.email !== email) {
          nextState = await repository.getAppState(previewProfile.email);
        }

        const matchedProfile =
          nextState.profiles.find((profile) => profile.id === previewProfileId) ?? previewProfile;
        if (matchedProfile) {
          nextState = {
            ...nextState,
            currentUser: matchedProfile,
            profiles: nextState.profiles.some((profile) => profile.id === matchedProfile.id)
              ? nextState.profiles
              : [matchedProfile, ...nextState.profiles]
          };
        }
      }

      if (!isMounted) return;

      setState(nextState);
      stateRef.current = nextState;
      setIsReady(true);
    }

    void syncAppState();

    return () => {
      isMounted = false;
    };
  }, [authIdentity, previewProfileId]);

  const conflictingSessionIds = useMemo(
    () => getConflictingSessionIds(state.sessions, state.savedSchedule),
    [state.savedSchedule, state.sessions]
  );

  const availableProfiles = useMemo(
    () =>
      mergeProfiles(state.profiles, defaultAppState.profiles)
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name)),
    [state.profiles]
  );

  const value = useMemo<AppStoreContextValue>(
    () => ({
      ...state,
      auth,
      isReady,
      isSupabaseEnabled,
      previewProfileId,
      isPreviewing: Boolean(previewProfileId),
      availableProfiles,
      conflictingSessionIds,
      sponsorAnalytics,
      submissions: state.submissions,
      scheduleControl: state.scheduleControl,
      setPreviewProfile(profileId) {
        const nextProfileId = profileId || null;
        writePreviewProfileId(nextProfileId);
        setPreviewProfileId(nextProfileId);
      },
      clearPreviewProfile() {
        writePreviewProfileId(null);
        setPreviewProfileId(null);
      },
      async createAttachment(input) {
        const attachment = await getRepository().createAttachment(input, state.currentUser.id);
        setState((currentState) => ({
          ...currentState,
          attachments: [attachment, ...currentState.attachments],
          scheduleChanges:
            input.ownerType === "session"
              ? [
                  {
                    id: `change-local-${attachment.id}`,
                    sessionId: input.ownerId,
                    releaseVersion: currentState.scheduleControl.releaseVersion + 1,
                    changeType: "materials",
                    summary: `${input.title} added to session materials.`,
                    isPublished: false,
                    createdAt: attachment.createdAt,
                    createdBy: state.currentUser.id
                  },
                  ...currentState.scheduleChanges
                ]
              : currentState.scheduleChanges,
          scheduleControl: {
            ...currentState.scheduleControl,
            hasUnpublishedChanges: true,
            lastEditedAt: new Date().toISOString()
          }
        }));
      },
      async deleteAttachment(attachmentId) {
        await getRepository().deleteAttachment(attachmentId);
        setState((currentState) => ({
          ...currentState,
          attachments: currentState.attachments.filter((attachment) => attachment.id !== attachmentId),
          scheduleControl: {
            ...currentState.scheduleControl,
            hasUnpublishedChanges: true,
            lastEditedAt: new Date().toISOString()
          }
        }));
      },
      async saveSession(sessionId) {
        const repository = getRepository();
        const currentState = stateRef.current;
        const savedSchedule = currentState.savedSchedule.some((entry) => entry.sessionId === sessionId)
          ? currentState.savedSchedule
          : [
              ...currentState.savedSchedule,
              { sessionId, savedAt: new Date().toISOString() }
            ];
        const nextState = { ...currentState, savedSchedule };

        stateRef.current = nextState;
        setState(nextState);

        await repository.saveSession(sessionId, currentState.currentUser.id);
        await repository.replaceSavedSchedule(savedSchedule, currentState.currentUser.id);
        await repository.logSessionEvent(sessionId, "save", currentState.currentUser.id);
      },
      async removeSavedSession(sessionId) {
        const repository = getRepository();
        const currentState = stateRef.current;
        const savedSchedule = currentState.savedSchedule.filter(
          (entry) => entry.sessionId !== sessionId
        );
        const nextState = { ...currentState, savedSchedule };

        stateRef.current = nextState;
        setState(nextState);

        await repository.removeSavedSession(sessionId, currentState.currentUser.id);
        await repository.replaceSavedSchedule(savedSchedule, currentState.currentUser.id);
        await repository.logSessionEvent(sessionId, "remove", currentState.currentUser.id);
      },
      async updateProfilePreferences(payload) {
        const currentUser = await getRepository().updateProfilePreferences(
          payload,
          state.currentUser.id
        );
        setState((currentState) => ({
          ...currentState,
          currentUser,
          profiles: currentState.profiles.map((profile) =>
            profile.id === currentUser.id ? currentUser : profile
          )
        }));
      },
      async updateSponsorProfile(sponsorId, payload) {
        const sponsor = await getRepository().updateSponsorProfile(sponsorId, payload);
        setState((currentState) => ({
          ...currentState,
          sponsors: currentState.sponsors.map((entry) =>
            entry.id === sponsor.id ? sponsor : entry
          )
        }));
      },
      async updateSubmissionReview(submissionId, payload) {
        const repository = getRepository();
        const submission = await repository.updateSubmissionReview(submissionId, payload);
        const sessions = await repository.getSessions();
        setState((currentState) => ({
          ...currentState,
          sessions,
          submissions: currentState.submissions.map((entry) =>
            entry.id === submission.id ? submission : entry
          )
        }));
      },
      async createSubmission(input) {
        const submission = await getRepository().createSubmission(input, {
          name: state.currentUser.name,
          email: state.currentUser.email,
          company: state.currentUser.company
        });
        setState((currentState) => ({
          ...currentState,
          submissions: [submission, ...currentState.submissions]
        }));
        return submission;
      },
      async updateScheduleControl(payload) {
        const scheduleControl = await getRepository().updateScheduleControl({
          ...state.scheduleControl,
          ...payload
        });
        setState((currentState) => ({
          ...currentState,
          scheduleControl
        }));
      },
      getOwnedSessions() {
        return state.sessions.filter(
          (session) =>
            session.ownerProfileId === state.currentUser.id ||
            session.speakers.some(
              (speaker) =>
                speaker.profileId === state.currentUser.id ||
                (state.currentUser.email
                  ? speaker.email?.toLowerCase() === state.currentUser.email.toLowerCase()
                  : false)
            )
        );
      },
      getOwnedSpeakers() {
        return state.sessions
          .flatMap((session) => session.speakers)
          .filter(
            (speaker, index, collection) =>
              (speaker.profileId === state.currentUser.id ||
                (state.currentUser.email
                  ? speaker.email?.toLowerCase() === state.currentUser.email.toLowerCase()
                  : false)) &&
              collection.findIndex((entry) => entry.id === speaker.id) === index
          );
      },
      async updateSessionWorkspace(sessionId, payload) {
        const session = await getRepository().updateSessionWorkspace(
          sessionId,
          payload,
          state.currentUser.id
        );
        setState((currentState) => ({
          ...currentState,
          sessions: currentState.sessions.map((entry) =>
            entry.id === session.id ? session : entry
          )
        }));
      },
      async updateSpeakerProfile(speakerId, payload) {
        const speaker = await getRepository().updateSpeakerProfile(speakerId, payload);
        setState((currentState) => ({
          ...currentState,
          sessions: currentState.sessions.map((session) => ({
            ...session,
            speakers: session.speakers.map((entry) =>
              entry.id === speaker.id ? speaker : entry
            )
          }))
        }));
      },
      async loadSponsorAnalytics(sponsorId) {
        const analytics = await getRepository().getSponsorAnalytics(sponsorId);
        setSponsorAnalytics((current) => ({ ...current, [sponsorId]: analytics }));
      },
      async logSponsorEvent(sponsorId, eventType, metadata) {
        await getRepository().logSponsorEvent(
          sponsorId,
          eventType,
          state.currentUser.id,
          metadata
        );

        const analytics = await getRepository().getSponsorAnalytics(sponsorId);
        setSponsorAnalytics((current) => ({ ...current, [sponsorId]: analytics }));
      },
      async requestMagicLink(email) {
        await signInWithMagicLink(email);
      },
      async signOut() {
        await signOutFromSupabase();
      },
      isSaved(sessionId) {
        return state.savedSchedule.some((entry) => entry.sessionId === sessionId);
      },
      getSessionBySlug(slug) {
        return state.sessions.find((session) => session.slug === slug);
      },
      getSponsorSessions(sponsorId) {
        return state.sessions.filter((session) => session.sponsorId === sponsorId);
      },
      getDiscoverableProfiles() {
        return state.profiles.filter((profile) => profile.isDiscoverable);
      },
      async toggleContactField(field) {
        const nextFields = state.currentUser.visibleContactFields.includes(field)
          ? state.currentUser.visibleContactFields.filter((value) => value !== field)
          : [...state.currentUser.visibleContactFields, field];

        const currentUser = await getRepository().updateProfilePreferences(
          {
            visibleContactFields: nextFields
          },
          state.currentUser.id
        );

        setState((currentState) => ({
          ...currentState,
          currentUser,
          profiles: currentState.profiles.map((profile) =>
            profile.id === currentUser.id ? currentUser : profile
          )
        }));
      }
    }),
    [
      auth,
      availableProfiles,
      conflictingSessionIds,
      isReady,
      isSupabaseEnabled,
      previewProfileId,
      sponsorAnalytics,
      state
    ]
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider.");
  }
  return context;
}
