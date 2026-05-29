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
  conflictingSessionIds: Set<string>;
  sponsorAnalytics: Record<string, SponsorAnalytics | undefined>;
  submissions: SessionSubmission[];
  scheduleControl: ScheduleControl;
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

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AppState>(defaultAppState);
  const stateRef = useRef(state);
  const [auth, setAuth] = useState<AuthSummary>({ status: "guest", email: null });
  const [isReady, setIsReady] = useState(false);
  const [sponsorAnalytics, setSponsorAnalytics] = useState<Record<string, SponsorAnalytics | undefined>>({});
  const isSupabaseEnabled = hasSupabaseConfig();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    let isMounted = true;
    const repository = getRepository();
    const client = getSupabaseBrowserClient();

    async function syncFromAuth(email: string | null, name?: string | null) {
      if (!isMounted) return;

      if (email) {
        await repository.ensureProfileFromAuth({ email, name });
      }

      const nextState = await repository.getAppState(email);
      if (!isMounted) return;

      setState(nextState);
      stateRef.current = nextState;
      setAuth({
        status: email ? "authenticated" : "guest",
        email
      });
      setIsReady(true);
    }

    if (!client) {
      void syncFromAuth(null);
      return () => {
        isMounted = false;
      };
    }

    client.auth
      .getSession()
      .then(({ data }) => {
        const session = data.session;
        return syncFromAuth(
          session?.user.email ?? null,
          session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? null
        );
      })
      .catch(() => syncFromAuth(null));

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, session) => {
      void syncFromAuth(
        session?.user.email ?? null,
        session?.user.user_metadata?.full_name ?? session?.user.user_metadata?.name ?? null
      );
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const conflictingSessionIds = useMemo(
    () => getConflictingSessionIds(state.sessions, state.savedSchedule),
    [state.savedSchedule, state.sessions]
  );

  const value = useMemo<AppStoreContextValue>(
    () => ({
      ...state,
      auth,
      isReady,
      isSupabaseEnabled,
      conflictingSessionIds,
      sponsorAnalytics,
      submissions: state.submissions,
      scheduleControl: state.scheduleControl,
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
        return state.sessions.filter((session) => session.ownerProfileId === state.currentUser.id);
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
    [auth, conflictingSessionIds, isReady, isSupabaseEnabled, sponsorAnalytics, state]
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
