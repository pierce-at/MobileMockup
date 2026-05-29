import { defaultAppState } from "@/lib/data/mock-data";
import type {
  Attachment,
  AttachmentCreateInput,
  AppState,
  AttendeeProfile,
  InterestTag,
  PersistedPreferences,
  ProfilePreferencesUpdate,
  ScheduleChange,
  ScheduleControl,
  SavedScheduleEntry,
  Session,
  SessionEventType,
  SessionSubmissionCreateInput,
  SessionWorkspaceUpdate,
  SessionSubmission,
  Speaker,
  SpeakerProfileUpdate,
  SubmissionReviewUpdate,
  SponsorAnalytics,
  SponsorEventRecord,
  SponsorEventType,
  SponsorProfileUpdate,
  Sponsor,
  Venue
} from "@/lib/domain/types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  mapProfileRow,
  mapScheduleControlRow,
  mapSessionRow,
  mapSpeakerRow,
  mapSubmissionRow,
  mapSponsorRow,
  mapVenueRow
} from "@/lib/supabase/mappers";
import type { Database } from "@/lib/supabase/database";

const STORAGE_KEY = "tcsw-attendee-app-state-v3";
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type SpeakerRow = Database["public"]["Tables"]["speakers"]["Row"];
type SavedScheduleRow = Pick<
  Database["public"]["Tables"]["saved_schedule"]["Row"],
  "session_id" | "created_at"
>;
type SavedScheduleInsert = Database["public"]["Tables"]["saved_schedule"]["Insert"];
type SubmissionInsert = Database["public"]["Tables"]["session_submissions"]["Insert"];
type SponsorEventInsert = Database["public"]["Tables"]["sponsor_events"]["Insert"];
type SessionEventInsert = Database["public"]["Tables"]["session_events"]["Insert"];
type SponsorEventRow = Pick<
  Database["public"]["Tables"]["sponsor_events"]["Row"],
  "event_type" | "created_at" | "metadata"
>;

let mockBaseState: AppState = structuredClone(defaultAppState);

export function resetMockRepositoryState() {
  mockBaseState = structuredClone(defaultAppState);
}

export interface AppRepository {
  getSessions(): Promise<Session[]>;
  getSessionBySlug(slug: string): Promise<Session | undefined>;
  getSponsors(): Promise<Sponsor[]>;
  getSponsorBySlug(slug: string): Promise<Sponsor | undefined>;
  getVenues(): Promise<Venue[]>;
  getProfiles(): Promise<AttendeeProfile[]>;
  getCurrentUser(authEmail?: string | null): Promise<AttendeeProfile>;
  getSavedSchedule(profileId?: string): Promise<SavedScheduleEntry[]>;
  getAppState(authEmail?: string | null): Promise<AppState>;
  getSubmissions(): Promise<SessionSubmission[]>;
  getScheduleControl(): Promise<ScheduleControl>;
  getAttachments(): Promise<Attachment[]>;
  getScheduleChanges(): Promise<ScheduleChange[]>;
  getOwnedSessions(profileId: string): Promise<Session[]>;
  getOwnedSpeakers(profileId: string): Promise<Speaker[]>;
  saveSession(sessionId: string, profileId?: string): Promise<SavedScheduleEntry[]>;
  removeSavedSession(sessionId: string, profileId?: string): Promise<SavedScheduleEntry[]>;
  replaceSavedSchedule(
    savedSchedule: SavedScheduleEntry[],
    profileId?: string
  ): Promise<SavedScheduleEntry[]>;
  createSubmission(
    input: SessionSubmissionCreateInput,
    profile?: Pick<AttendeeProfile, "name" | "email" | "company">
  ): Promise<SessionSubmission>;
  updateProfilePreferences(
    payload: ProfilePreferencesUpdate,
    profileId?: string
  ): Promise<AttendeeProfile>;
  updateSubmissionReview(
    submissionId: string,
    payload: SubmissionReviewUpdate
  ): Promise<SessionSubmission>;
  updateScheduleControl(payload: Partial<ScheduleControl>): Promise<ScheduleControl>;
  createAttachment(input: AttachmentCreateInput, uploadedBy?: string): Promise<Attachment>;
  deleteAttachment(attachmentId: string): Promise<void>;
  updateSessionWorkspace(
    sessionId: string,
    payload: SessionWorkspaceUpdate,
    profileId?: string
  ): Promise<Session>;
  updateSpeakerProfile(speakerId: string, payload: SpeakerProfileUpdate): Promise<Speaker>;
  ensureProfileFromAuth(input: { email: string; name?: string | null }): Promise<AttendeeProfile>;
  updateSponsorProfile(sponsorId: string, payload: SponsorProfileUpdate): Promise<Sponsor>;
  getSponsorAnalytics(sponsorId: string): Promise<SponsorAnalytics>;
  logSessionEvent(
    sessionId: string,
    eventType: SessionEventType,
    profileId?: string,
    metadata?: Record<string, string>
  ): Promise<void>;
  logSponsorEvent(
    sponsorId: string,
    eventType: SponsorEventType,
    profileId?: string,
    metadata?: Record<string, string>
  ): Promise<void>;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getPersistedPreferences(): PersistedPreferences | null {
  if (!canUseStorage()) return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as PersistedPreferences;
  } catch {
    return null;
  }
}

function writePersistedPreferences(preferences: PersistedPreferences) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function sanitizeSavedSchedule(
  savedSchedule: SavedScheduleEntry[],
  sessions: Session[]
): SavedScheduleEntry[] {
  const validIds = new Set(sessions.map((session) => session.id));
  const seenIds = new Set<string>();

  return savedSchedule.filter((entry) => {
    if (!entry?.sessionId || !validIds.has(entry.sessionId) || seenIds.has(entry.sessionId)) {
      return false;
    }

    seenIds.add(entry.sessionId);
    return true;
  });
}

export function hydrateAppState(baseState = mockBaseState): AppState {
  const preferences = getPersistedPreferences();
  if (!preferences) return baseState;

  const currentUser = {
    ...baseState.currentUser,
    isDiscoverable: preferences.currentUserDiscoverable,
    visibleContactFields: preferences.currentUserVisibleContactFields,
    interests: preferences.currentUserInterests ?? baseState.currentUser.interests
  };

  const profiles = baseState.profiles.map((profile) =>
    profile.id === currentUser.id ? currentUser : profile
  );

  return {
    ...baseState,
    currentUser,
    profiles,
    savedSchedule: sanitizeSavedSchedule(preferences.savedSchedule, baseState.sessions)
  };
}

function persistFromState(state: AppState) {
  writePersistedPreferences({
    savedSchedule: state.savedSchedule,
    currentUserDiscoverable: state.currentUser.isDiscoverable,
    currentUserVisibleContactFields: state.currentUser.visibleContactFields,
    currentUserInterests: state.currentUser.interests
  });
}

function getNextState(mutator: (state: AppState) => AppState) {
  const state = hydrateAppState();
  const nextState = mutator(state);
  mockBaseState = nextState;
  persistFromState(nextState);
  return nextState;
}

function buildFallbackProfile(email: string, name?: string | null): AttendeeProfile {
  const localPart = email.split("@")[0] ?? "guest";
  const titleCaseName =
    name?.trim() ||
    localPart
      .split(/[.\-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  const initials = titleCaseName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return {
    ...defaultAppState.currentUser,
    id: `profile-${localPart}`,
    name: titleCaseName || "Guest Attendee",
    email,
    avatar: initials || "GA",
    interests: [],
    contactLinks: {
      ...defaultAppState.currentUser.contactLinks,
      email
    }
  };
}

function buildGuestProfile(): AttendeeProfile {
  return {
    ...defaultAppState.currentUser,
    id: "guest-local",
    name: "Guest Attendee",
    role: "Guest",
    appRole: "attendee",
    company: "Visiting",
    bio: "Exploring the event experience before signing in.",
    avatar: "GA",
    email: undefined,
    sponsorId: undefined,
    contactLinks: {},
    visibleContactFields: [],
    interests: [],
    isDiscoverable: false
  };
}

function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getDraftTimeForDay(day?: SessionSubmission["requestedDay"]) {
  switch (day) {
    case "mon":
      return { startTime: "2:00 PM", endTime: "2:45 PM" };
    case "tue":
      return { startTime: "2:00 PM", endTime: "2:45 PM" };
    case "wed":
      return { startTime: "2:00 PM", endTime: "2:45 PM" };
    case "thu":
      return { startTime: "2:00 PM", endTime: "2:45 PM" };
    case "fri":
      return { startTime: "1:30 PM", endTime: "2:15 PM" };
    default:
      return { startTime: "2:00 PM", endTime: "2:45 PM" };
  }
}

function ensureUniqueSlug(baseSlug: string, sessions: Session[]) {
  const fallback = baseSlug || "session-draft";
  let candidate = fallback;
  let counter = 2;

  while (sessions.some((session) => session.slug === candidate)) {
    candidate = `${fallback}-${counter}`;
    counter += 1;
  }

  return candidate;
}

function getSubmissionOwnerProfileId(
  submission: SessionSubmission,
  profiles: AttendeeProfile[]
) {
  if (submission.submitterProfileId) return submission.submitterProfileId;
  return profiles.find((profile) => profile.email?.toLowerCase() === submission.submitterEmail.toLowerCase())
    ?.id;
}

function buildDraftSessionFromSubmission(
  submission: SessionSubmission,
  state: AppState
): Session {
  const slug = ensureUniqueSlug(slugifyTitle(submission.title), state.sessions);
  const draftTimes = getDraftTimeForDay(submission.requestedDay);
  const ownerProfileId = getSubmissionOwnerProfileId(submission, state.profiles);
  const preferredVenue = state.venues.find((venue) => venue.id === "umn") ?? state.venues[0];

  return {
    id: `session-${crypto.randomUUID()}`,
    slug,
    title: submission.title,
    description: submission.fullDescription || submission.summary,
    day: submission.requestedDay ?? "wed",
    startTime: draftTimes.startTime,
    endTime: draftTimes.endTime,
    venueId: preferredVenue.id,
    room: `Draft assignment · ${submission.track}`,
    speakers: [],
    tags: submission.themes.length ? submission.themes : [submission.track],
    isFeatured: false,
    isSponsored: false,
    attendeeCount: 0,
    ownerProfileId,
    sourceSubmissionId: submission.id,
    logisticsNotes: submission.logisticsNeeds || undefined,
    hostNotes: submission.speakerDetails || undefined,
    updatedAt: new Date().toISOString()
  };
}

export const mockRepository: AppRepository = {
  async getSessions() {
    return hydrateAppState().sessions;
  },
  async getSessionBySlug(slug) {
    return hydrateAppState().sessions.find((session) => session.slug === slug);
  },
  async getSponsors() {
    return hydrateAppState().sponsors;
  },
  async getSponsorBySlug(slug) {
    return hydrateAppState().sponsors.find((sponsor) => sponsor.slug === slug);
  },
  async getVenues() {
    return hydrateAppState().venues;
  },
  async getProfiles() {
    return hydrateAppState().profiles;
  },
  async getCurrentUser(authEmail) {
    if (!authEmail) return hydrateAppState().currentUser;

    const state = hydrateAppState();
    return (
      state.profiles.find((profile) => profile.email?.toLowerCase() === authEmail.toLowerCase()) ??
      buildFallbackProfile(authEmail)
    );
  },
  async getSavedSchedule() {
    return hydrateAppState().savedSchedule;
  },
  async getAppState(authEmail) {
    const baseState = hydrateAppState();
    const currentUser = await this.getCurrentUser(authEmail);
    const profiles = baseState.profiles.some((profile) => profile.id === currentUser.id)
      ? baseState.profiles.map((profile) => (profile.id === currentUser.id ? currentUser : profile))
      : [currentUser, ...baseState.profiles];

    return {
      ...baseState,
      currentUser,
      profiles
    };
  },
  async getSubmissions() {
    return hydrateAppState().submissions;
  },
  async getScheduleControl() {
    return hydrateAppState().scheduleControl;
  },
  async getOwnedSessions(profileId) {
    return hydrateAppState().sessions.filter((session) => session.ownerProfileId === profileId);
  },
  async getAttachments() {
    return hydrateAppState().attachments;
  },
  async getScheduleChanges() {
    return hydrateAppState().scheduleChanges;
  },
  async getOwnedSpeakers(profileId) {
    return hydrateAppState()
      .sessions.flatMap((session) => session.speakers)
      .filter((speaker, index, collection) =>
        (speaker.profileId === profileId ||
          speaker.email?.toLowerCase() ===
            hydrateAppState().profiles.find((profile) => profile.id === profileId)?.email?.toLowerCase()) &&
        collection.findIndex((entry) => entry.id === speaker.id) === index
      );
  },
  async saveSession(sessionId) {
    const nextState = getNextState((state) => {
      if (state.savedSchedule.some((entry) => entry.sessionId === sessionId)) {
        return state;
      }

      return {
        ...state,
        savedSchedule: [
          ...state.savedSchedule,
          { sessionId, savedAt: new Date().toISOString() }
        ]
      };
    });

    return nextState.savedSchedule;
  },
  async removeSavedSession(sessionId) {
    const nextState = getNextState((state) => ({
      ...state,
      savedSchedule: state.savedSchedule.filter((entry) => entry.sessionId !== sessionId)
    }));

    return nextState.savedSchedule;
  },
  async replaceSavedSchedule(savedSchedule) {
    const nextState = getNextState((state) => ({
      ...state,
      savedSchedule: sanitizeSavedSchedule(savedSchedule, state.sessions)
    }));

    return nextState.savedSchedule;
  },
  async createSubmission(input, profile) {
    const state = hydrateAppState();
    const matchedProfile = profile?.email
      ? state.profiles.find((entry) => entry.email?.toLowerCase() === profile.email?.toLowerCase())
      : undefined;

    const submission: SessionSubmission = {
      id: `submission-${crypto.randomUUID()}`,
      title: input.title,
      submitterName: profile?.name ?? "Guest submitter",
      submitterEmail: profile?.email ?? "guest@example.com",
      submitterProfileId: matchedProfile?.id,
      company: input.company || profile?.company || "Independent",
      track: input.track,
      format: input.format,
      summary: input.summary,
      fullDescription: input.fullDescription,
      intendedAudience: input.intendedAudience,
      themes: input.themes,
      speakerDetails: input.speakerDetails,
      logisticsNeeds: input.logisticsNeeds,
      submissionResources: input.submissionResources,
      requestedDay: input.requestedDay,
      status: "submitted",
      internalNotes: "",
      decisionNote: "",
      assignedReviewer: undefined,
      lastReviewedAt: undefined,
      linkedSessionId: undefined,
      createdAt: new Date().toISOString()
    };

    getNextState((currentState) => ({
      ...currentState,
      submissions: [submission, ...currentState.submissions]
    }));

    return submission;
  },
  async updateProfilePreferences(payload) {
    const nextState = getNextState((state) => {
      const currentUser = {
        ...state.currentUser,
        isDiscoverable: payload.isDiscoverable ?? state.currentUser.isDiscoverable,
        visibleContactFields:
          payload.visibleContactFields ?? state.currentUser.visibleContactFields,
        interests: payload.interests ?? state.currentUser.interests
      };

      const profiles = state.profiles.map((profile) =>
        profile.id === currentUser.id ? currentUser : profile
      );

      return {
        ...state,
        currentUser,
        profiles
      };
    });

    return nextState.currentUser;
  },
  async updateSubmissionReview(submissionId, payload) {
    const nextState = getNextState((state) => {
      const existing = state.submissions.find((submission) => submission.id === submissionId);
      if (!existing) return state;

      let linkedSessionId =
        payload.linkedSessionId === null
          ? undefined
          : payload.linkedSessionId ?? existing.linkedSessionId;
      let sessions = state.sessions;

      if (
        (payload.status === "approved" || payload.status === "scheduled") &&
        !linkedSessionId
      ) {
        const draftSession = buildDraftSessionFromSubmission(existing, state);
        linkedSessionId = draftSession.id;
        sessions = [draftSession, ...state.sessions];
      }

      const submission: SessionSubmission = {
        ...existing,
        status: payload.status ?? existing.status,
        internalNotes: payload.internalNotes ?? existing.internalNotes,
        decisionNote: payload.decisionNote ?? existing.decisionNote,
        assignedReviewer:
          payload.assignedReviewer === undefined
            ? existing.assignedReviewer
            : payload.assignedReviewer || undefined,
        linkedSessionId,
        lastReviewedAt: new Date().toISOString()
      };

      return {
        ...state,
        sessions,
        submissions: state.submissions.map((entry) =>
          entry.id === submission.id ? submission : entry
        )
      };
    });

    return nextState.submissions.find((submission) => submission.id === submissionId)!;
  },
  async updateScheduleControl(payload) {
    const nextState = getNextState((state) => {
      const nextPublished =
        payload.isPublished === undefined ? state.scheduleControl.isPublished : payload.isPublished;
      const releaseVersion =
        nextPublished && !state.scheduleControl.isPublished
          ? state.scheduleControl.releaseVersion + 1
          : state.scheduleControl.releaseVersion;

      return {
        ...state,
        scheduleControl: {
          ...state.scheduleControl,
          ...payload,
          isPublished: nextPublished,
          releaseVersion,
          hasUnpublishedChanges: nextPublished ? false : state.scheduleControl.hasUnpublishedChanges,
          lastEditedAt: new Date().toISOString()
        },
        scheduleChanges: state.scheduleChanges.map((change) =>
          nextPublished ? { ...change, isPublished: true, releaseVersion } : change
        ),
        notifications: nextPublished
          ? [
              {
                id: `notification-publish-${releaseVersion}`,
                title: `Schedule version ${releaseVersion} is live`,
                body: "Fresh room, venue, and materials updates are now visible to attendees.",
                type: "publish",
                createdAt: new Date().toISOString(),
                read: false,
                actionHref: "/app/schedule"
              },
              ...state.notifications
            ]
          : state.notifications,
        auditLogs: [
          {
            id: `audit-${crypto.randomUUID()}`,
            actor: "System",
            action: nextPublished ? `Published release version ${releaseVersion}` : "Updated draft schedule control",
            subject: "Schedule control",
            createdAt: new Date().toISOString()
          },
          ...state.auditLogs
        ]
      };
    });

    return nextState.scheduleControl;
  },
  async createAttachment(input, uploadedBy) {
    const attachment: Attachment = {
      id: `attachment-${crypto.randomUUID()}`,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      title: input.title,
      kind: input.kind,
      url: input.url,
      fileName: input.fileName,
      mimeType: input.mimeType,
      visibility: input.visibility,
      featured: input.featured,
      uploadedBy,
      createdAt: new Date().toISOString()
    };

    getNextState((state) => ({
      ...state,
      attachments: [attachment, ...state.attachments],
      scheduleControl: {
        ...state.scheduleControl,
        hasUnpublishedChanges: true,
        lastEditedAt: new Date().toISOString()
      },
      scheduleChanges:
        input.ownerType === "session"
          ? [
              {
                id: `change-${crypto.randomUUID()}`,
                sessionId: input.ownerId,
                releaseVersion: state.scheduleControl.releaseVersion + 1,
                changeType: "materials",
                summary: `${input.title} added to session materials.`,
                isPublished: false,
                createdAt: new Date().toISOString(),
                createdBy: uploadedBy
              },
              ...state.scheduleChanges
            ]
          : state.scheduleChanges
    }));

    return attachment;
  },
  async deleteAttachment(attachmentId) {
    getNextState((state) => ({
      ...state,
      attachments: state.attachments.filter((attachment) => attachment.id !== attachmentId),
      scheduleControl: {
        ...state.scheduleControl,
        hasUnpublishedChanges: true,
        lastEditedAt: new Date().toISOString()
      }
    }));
    return;
  },
  async updateSessionWorkspace(sessionId, payload) {
    const session = hydrateAppState().sessions.find((entry) => entry.id === sessionId);
    if (!session) {
      return defaultAppState.sessions[0];
    }

    const nextState = getNextState((state) => {
      const current = state.sessions.find((entry) => entry.id === sessionId) ?? session;
      const nextSession: Session = {
        ...current,
        title: payload.title ?? current.title,
        description: payload.description ?? current.description,
        logisticsNotes: payload.logisticsNotes ?? current.logisticsNotes,
        hostNotes: payload.hostNotes ?? current.hostNotes,
        lastScheduleChangeAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newChanges: ScheduleChange[] = [];
      if ((payload.title ?? current.title) !== current.title) {
        newChanges.push({
          id: `change-${crypto.randomUUID()}`,
          sessionId,
          releaseVersion: state.scheduleControl.releaseVersion + 1,
          changeType: "title",
          summary: "Session title updated.",
          isPublished: false,
          createdAt: new Date().toISOString(),
          createdBy: current.ownerProfileId
        });
      }
      if ((payload.description ?? current.description) !== current.description) {
        newChanges.push({
          id: `change-${crypto.randomUUID()}`,
          sessionId,
          releaseVersion: state.scheduleControl.releaseVersion + 1,
          changeType: "description",
          summary: "Session description updated.",
          isPublished: false,
          createdAt: new Date().toISOString(),
          createdBy: current.ownerProfileId
        });
      }

      return {
        ...state,
        sessions: state.sessions.map((entry) => (entry.id === sessionId ? nextSession : entry)),
        scheduleControl: {
          ...state.scheduleControl,
          hasUnpublishedChanges: true,
          lastEditedAt: new Date().toISOString()
        },
        scheduleChanges: [...newChanges, ...state.scheduleChanges]
      };
    });

    return nextState.sessions.find((entry) => entry.id === sessionId) ?? session;
  },
  async updateSpeakerProfile(speakerId, payload) {
    const speaker = hydrateAppState()
      .sessions.flatMap((session) => session.speakers)
      .find((entry) => entry.id === speakerId);

    if (!speaker) {
      return {
        id: speakerId,
        name: "Speaker",
        role: "Speaker",
        company: "TCSW",
        bio: "",
        avatar: "SP",
        updatedAt: new Date().toISOString()
      };
    }

    return {
      ...speaker,
      name: payload.name ?? speaker.name,
      role: payload.role ?? speaker.role,
      company: payload.company ?? speaker.company,
      bio: payload.bio ?? speaker.bio,
      avatar: payload.avatar ?? speaker.avatar,
      updatedAt: new Date().toISOString()
    };
  },
  async ensureProfileFromAuth({ email, name }) {
    return this.getCurrentUser(email) ?? buildFallbackProfile(email, name);
  },
  async updateSponsorProfile(sponsorId, payload) {
    const state = hydrateAppState();
    const sponsor = state.sponsors.find((entry) => entry.id === sponsorId);
    return sponsor
      ? {
          ...sponsor,
          description: payload.description ?? sponsor.description,
          track: payload.track ?? sponsor.track,
          tier: payload.tier ?? sponsor.tier,
          contactLinks: payload.contactLinks ?? sponsor.contactLinks
        }
      : {
          ...defaultAppState.sponsors[0],
          id: sponsorId
        };
  },
  async getSponsorAnalytics(sponsorId) {
    return {
      sponsorId,
      profileViews: 0,
      contactClicks: 0,
      sessionViews: 0,
      mapPinTaps: 0,
      ctaClicks: 0,
      lastEventAt: null,
      events: []
    };
  },
  async logSessionEvent() {
    return;
  },
  async logSponsorEvent() {
    return;
  }
};

const supabaseRepository: AppRepository = {
  async getSessions() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getSessions();

    const [{ data: sessionRows, error: sessionsError }, { data: speakerRows, error: speakersError }] =
      await Promise.all([
        client.from("sessions").select("*").order("day").order("start_time"),
        client.from("speakers").select("*")
      ]);

    if (sessionsError || speakersError || !sessionRows || !speakerRows) {
      return mockRepository.getSessions();
    }

    const typedSpeakerRows = speakerRows as SpeakerRow[];
    const typedSessionRows = sessionRows as SessionRow[];
    const speakersById = new Map(
      typedSpeakerRows.map((row) => [row.id, mapSpeakerRow(row)] as const)
    );
    return typedSessionRows.map((row) => mapSessionRow(row, speakersById));
  },
  async getSessionBySlug(slug) {
    const sessions = await this.getSessions();
    return sessions.find((session) => session.slug === slug);
  },
  async getSponsors() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getSponsors();

    const { data, error } = await client.from("sponsors").select("*").order("name");
    if (error || !data) return mockRepository.getSponsors();

    return data.map(mapSponsorRow);
  },
  async getSponsorBySlug(slug) {
    const sponsors = await this.getSponsors();
    return sponsors.find((sponsor) => sponsor.slug === slug);
  },
  async getVenues() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getVenues();

    const { data, error } = await client.from("venues").select("*").order("name");
    if (error || !data) return mockRepository.getVenues();

    return data.map(mapVenueRow);
  },
  async getProfiles() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getProfiles();

    const { data, error } = await client.from("profiles").select("*").order("name");
    if (error || !data) return mockRepository.getProfiles();

    return data.map(mapProfileRow);
  },
  async getCurrentUser(authEmail) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getCurrentUser(authEmail);
    if (!authEmail) return buildGuestProfile();

    const { data, error } = await client
      .from("profiles")
      .select("*")
      .ilike("email", authEmail)
      .maybeSingle();

    if (error || !data) {
      return buildFallbackProfile(authEmail);
    }

    return mapProfileRow(data);
  },
  async getSavedSchedule(profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.getSavedSchedule();

    const { data, error } = await client
      .from("saved_schedule")
      .select("session_id, created_at")
      .eq("profile_id", profileId)
      .order("created_at");

    if (error || !data) return mockRepository.getSavedSchedule();

    return (data as SavedScheduleRow[]).map((row) => ({
      sessionId: row.session_id,
      savedAt: row.created_at
    }));
  },
  async getAppState(authEmail) {
    const [sessions, sponsors, venues, profiles, currentUser, submissions, scheduleControl, attachments, scheduleChanges] =
      await Promise.all([
      this.getSessions(),
      this.getSponsors(),
      this.getVenues(),
      this.getProfiles(),
      this.getCurrentUser(authEmail),
      this.getSubmissions(),
      this.getScheduleControl(),
      this.getAttachments(),
      this.getScheduleChanges()
    ]);

    const savedSchedule = authEmail
      ? await this.getSavedSchedule(currentUser.id)
      : await mockRepository.getSavedSchedule();
    const nextProfiles = profiles.some((profile) => profile.id === currentUser.id)
      ? profiles.map((profile) => (profile.id === currentUser.id ? currentUser : profile))
      : [currentUser, ...profiles];

    return {
      currentUser,
      savedSchedule,
      profiles: nextProfiles,
      sessions,
      venues,
      sponsors,
      submissions,
      scheduleControl,
      attachments,
      scheduleChanges,
      volunteerAssignments: defaultAppState.volunteerAssignments,
      notifications: defaultAppState.notifications,
      sponsorFulfillment: defaultAppState.sponsorFulfillment,
      auditLogs: defaultAppState.auditLogs
    };
  },
  async getSubmissions() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getSubmissions();

    const { data, error } = await client
      .from("session_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(mapSubmissionRow);
  },
  async getScheduleControl() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getScheduleControl();

    const { data, error } = await client
      .from("schedule_controls")
      .select("*")
      .eq("id", "tcsw-2026")
      .maybeSingle();

    if (error || !data) return mockRepository.getScheduleControl();
    return mapScheduleControlRow(data);
  },
  async getAttachments() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getAttachments();

    const { data, error } = await client.from("attachments").select("*").order("created_at", { ascending: false });
    if (error || !data) return mockRepository.getAttachments();

    return data.map((row: any) => ({
      id: row.id,
      ownerType: row.owner_type,
      ownerId: row.owner_id,
      title: row.title,
      kind: row.kind,
      url: row.url,
      fileName: row.file_name ?? undefined,
      mimeType: row.mime_type ?? undefined,
      visibility: row.visibility,
      featured: row.featured ?? false,
      uploadedBy: row.uploaded_by ?? undefined,
      createdAt: row.created_at
    }));
  },
  async getScheduleChanges() {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getScheduleChanges();

    const { data, error } = await client
      .from("schedule_changes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return mockRepository.getScheduleChanges();

    return data.map((row: any) => ({
      id: row.id,
      sessionId: row.session_id,
      releaseVersion: row.release_version,
      changeType: row.change_type,
      summary: row.summary,
      isPublished: row.is_published,
      createdAt: row.created_at,
      createdBy: row.created_by ?? undefined
    }));
  },
  async getOwnedSessions(profileId) {
    const sessions = await this.getSessions();
    return sessions.filter((session) => session.ownerProfileId === profileId);
  },
  async getOwnedSpeakers(profileId) {
    const sessions = await this.getSessions();
    const currentUser = await this.getCurrentUser();
    const email = currentUser.email?.toLowerCase();
    const speakers = sessions.flatMap((session) => session.speakers);
    return speakers.filter(
      (speaker, index, collection) =>
        (speaker.profileId === profileId ||
          (email ? speaker.email?.toLowerCase() === email : false)) &&
        collection.findIndex((entry) => entry.id === speaker.id) === index
    );
  },
  async saveSession(sessionId, profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.saveSession(sessionId);

    const { error } = await (client.from("saved_schedule") as any).upsert(
      [
        {
          profile_id: profileId,
          session_id: sessionId,
          created_at: new Date().toISOString()
        } as SavedScheduleInsert
      ],
      { onConflict: "profile_id,session_id", ignoreDuplicates: true }
    );

    if (error) return mockRepository.saveSession(sessionId);
    return this.getSavedSchedule(profileId);
  },
  async removeSavedSession(sessionId, profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.removeSavedSession(sessionId);

    const { error } = await client
      .from("saved_schedule")
      .delete()
      .eq("profile_id", profileId)
      .eq("session_id", sessionId);

    if (error) return mockRepository.removeSavedSession(sessionId);
    return this.getSavedSchedule(profileId);
  },
  async replaceSavedSchedule(savedSchedule, profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.replaceSavedSchedule(savedSchedule);

    const cleanSchedule = sanitizeSavedSchedule(savedSchedule, await this.getSessions());

    const { error: deleteError } = await client
      .from("saved_schedule")
      .delete()
      .eq("profile_id", profileId);

    if (deleteError) return mockRepository.replaceSavedSchedule(cleanSchedule);

    if (!cleanSchedule.length) return [];

    const { error: insertError } = await (client.from("saved_schedule") as any).upsert(
      cleanSchedule.map(
        (entry) =>
          ({
            profile_id: profileId,
            session_id: entry.sessionId,
            created_at: entry.savedAt
          }) as SavedScheduleInsert
      ),
      { onConflict: "profile_id,session_id" }
    );

    if (insertError) return mockRepository.replaceSavedSchedule(cleanSchedule);
    return this.getSavedSchedule(profileId);
  },
  async createSubmission(input, profile) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.createSubmission(input, profile);

    const matchedProfile = profile?.email
      ? (await this.getProfiles()).find(
          (entry) => entry.email?.toLowerCase() === profile.email?.toLowerCase()
        )
      : undefined;
    const submissionId = `submission-${crypto.randomUUID()}`;
    const { data, error } = await (client
      .from("session_submissions") as any)
      .insert({
        id: submissionId,
        title: input.title,
        submitter_name: profile?.name ?? "Guest submitter",
        submitter_email: profile?.email ?? "guest@example.com",
        submitter_profile_id: matchedProfile?.id ?? null,
        company: input.company || profile?.company || "Independent",
        track: input.track,
        format: input.format,
        summary: input.summary,
        full_description: input.fullDescription,
        intended_audience: input.intendedAudience,
        themes: input.themes,
        speaker_details: input.speakerDetails,
        logistics_needs: input.logisticsNeeds,
        submission_resources: input.submissionResources,
        requested_day: input.requestedDay ?? null,
        status: "submitted",
        internal_notes: "",
        decision_note: "",
        assigned_reviewer: null,
        last_reviewed_at: null,
        linked_session_id: null,
        created_at: new Date().toISOString()
      } as SubmissionInsert)
      .select("*")
      .single();

    if (error || !data) return mockRepository.createSubmission(input, profile);
    return mapSubmissionRow(data);
  },
  async updateProfilePreferences(payload, profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.updateProfilePreferences(payload);

    const { data, error } = await (client
      .from("profiles") as any)
      .update({
        is_discoverable: payload.isDiscoverable,
        visible_contact_fields: payload.visibleContactFields,
        interests: payload.interests
      })
      .eq("id", profileId)
      .select("*")
      .single();

    if (error || !data) return mockRepository.updateProfilePreferences(payload);
    return mapProfileRow(data);
  },
  async updateSubmissionReview(submissionId, payload) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.updateSubmissionReview(submissionId, payload);

    const { data: existingData, error: existingError } = await (client
      .from("session_submissions") as any)
      .select("*")
      .eq("id", submissionId)
      .single();

    if (existingError || !existingData) {
      return mockRepository.updateSubmissionReview(submissionId, payload);
    }

    const existingSubmission = mapSubmissionRow(existingData);
    let linkedSessionId =
      payload.linkedSessionId === null
        ? undefined
        : payload.linkedSessionId ?? existingSubmission.linkedSessionId;

    if ((payload.status === "approved" || payload.status === "scheduled") && !linkedSessionId) {
      const [sessions, profiles] = await Promise.all([this.getSessions(), this.getProfiles()]);
      const draftSession = buildDraftSessionFromSubmission(existingSubmission, {
        currentUser: buildGuestProfile(),
        savedSchedule: [],
        profiles,
        sessions,
        venues: await this.getVenues(),
        sponsors: await this.getSponsors(),
        submissions: [existingSubmission],
        scheduleControl: await this.getScheduleControl(),
        attachments: [],
        scheduleChanges: [],
        volunteerAssignments: [],
        notifications: [],
        sponsorFulfillment: [],
        auditLogs: []
      });

      const { data: createdSession, error: sessionError } = await (client
        .from("sessions") as any)
        .insert({
          id: draftSession.id,
          slug: draftSession.slug,
          title: draftSession.title,
          description: draftSession.description,
          day: draftSession.day,
          start_time: draftSession.startTime,
          end_time: draftSession.endTime,
          venue_id: draftSession.venueId,
          room: draftSession.room,
          sponsor_id: draftSession.sponsorId ?? null,
          speaker_ids: [],
          owner_profile_id: draftSession.ownerProfileId ?? null,
          source_submission_id: draftSession.sourceSubmissionId ?? null,
          tags: draftSession.tags,
          is_featured: draftSession.isFeatured,
          is_sponsored: draftSession.isSponsored,
          capacity: draftSession.capacity ?? null,
          attendee_count: draftSession.attendeeCount,
          logistics_notes: draftSession.logisticsNotes ?? null,
          host_notes: draftSession.hostNotes ?? null
        })
        .select("id")
        .single();

      if (!sessionError && createdSession) {
        linkedSessionId = createdSession.id;
      }
    }

    const { data, error } = await (client
      .from("session_submissions") as any)
      .update({
        status: payload.status,
        internal_notes: payload.internalNotes,
        decision_note: payload.decisionNote,
        assigned_reviewer: payload.assignedReviewer,
        linked_session_id: linkedSessionId ?? null,
        last_reviewed_at: new Date().toISOString()
      })
      .eq("id", submissionId)
      .select("*")
      .single();

    if (error || !data) return existingSubmission;
    return mapSubmissionRow(data);
  },
  async updateScheduleControl(payload) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.updateScheduleControl(payload);

    const updatePayload = {
      is_published: payload.isPublished,
      locked_at: payload.lockedAt,
      published_at: payload.publishedAt,
      announcement: payload.announcement,
      release_version: payload.releaseVersion,
      has_unpublished_changes: payload.hasUnpublishedChanges,
      last_published_by: payload.lastPublishedBy,
      last_edited_at: payload.lastEditedAt
    };

    const { data, error } = await (client
      .from("schedule_controls") as any)
      .update(updatePayload)
      .eq("id", payload.id ?? "tcsw-2026")
      .select("*")
      .single();

    if (error || !data) return mockRepository.updateScheduleControl(payload);
    if (payload.isPublished) {
      await (client.from("schedule_changes") as any)
        .update({ is_published: true, release_version: payload.releaseVersion ?? null })
        .eq("is_published", false);
    }
    return mapScheduleControlRow(data);
  },
  async createAttachment(input, uploadedBy) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.createAttachment(input, uploadedBy);

    const { data, error } = await (client.from("attachments") as any)
      .insert({
        id: `attachment-${crypto.randomUUID()}`,
        owner_type: input.ownerType,
        owner_id: input.ownerId,
        title: input.title,
        kind: input.kind,
        url: input.url,
        file_name: input.fileName ?? null,
        mime_type: input.mimeType ?? null,
        visibility: input.visibility,
        featured: input.featured ?? false,
        uploaded_by: uploadedBy ?? null
      })
      .select("*")
      .single();

    if (error || !data) return mockRepository.createAttachment(input, uploadedBy);

    if (input.ownerType === "session") {
      await (client.from("schedule_changes") as any).insert({
        id: `change-${crypto.randomUUID()}`,
        session_id: input.ownerId,
        release_version: 0,
        change_type: "materials",
        summary: `${input.title} added to session materials.`,
        is_published: false,
        created_by: uploadedBy ?? null
      });
      await (client.from("schedule_controls") as any)
        .update({
          has_unpublished_changes: true,
          last_edited_at: new Date().toISOString()
        })
        .eq("id", "tcsw-2026");
    }

    return {
      id: data.id,
      ownerType: data.owner_type,
      ownerId: data.owner_id,
      title: data.title,
      kind: data.kind,
      url: data.url,
      fileName: data.file_name ?? undefined,
      mimeType: data.mime_type ?? undefined,
      visibility: data.visibility,
      featured: data.featured ?? false,
      uploadedBy: data.uploaded_by ?? undefined,
      createdAt: data.created_at
    };
  },
  async deleteAttachment(attachmentId) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.deleteAttachment(attachmentId);
    await client.from("attachments").delete().eq("id", attachmentId);
  },
  async updateSessionWorkspace(sessionId, payload, profileId) {
    const client = getSupabaseBrowserClient();
    if (!client || !profileId) return mockRepository.updateSessionWorkspace(sessionId, payload);

    const { data, error } = await (client
      .from("sessions") as any)
      .update({
        title: payload.title,
        description: payload.description,
        logistics_notes: payload.logisticsNotes,
        host_notes: payload.hostNotes
      })
      .eq("id", sessionId)
      .eq("owner_profile_id", profileId)
      .select("*")
      .single();

    if (error || !data) return mockRepository.updateSessionWorkspace(sessionId, payload);

    const previousSession = (await this.getSessions()).find((session) => session.id === sessionId);
    const changeRows: Array<Record<string, unknown>> = [];
    if (previousSession && payload.title && payload.title !== previousSession.title) {
      changeRows.push({
        id: `change-${crypto.randomUUID()}`,
        session_id: sessionId,
        release_version: 0,
        change_type: "title",
        summary: "Session title updated.",
        is_published: false,
        created_by: profileId ?? null
      });
    }
    if (previousSession && payload.description && payload.description !== previousSession.description) {
      changeRows.push({
        id: `change-${crypto.randomUUID()}`,
        session_id: sessionId,
        release_version: 0,
        change_type: "description",
        summary: "Session description updated.",
        is_published: false,
        created_by: profileId ?? null
      });
    }
    if (changeRows.length) {
      await (client.from("schedule_changes") as any).insert(changeRows);
      await (client.from("schedule_controls") as any)
        .update({
          has_unpublished_changes: true,
          last_edited_at: new Date().toISOString()
        })
        .eq("id", "tcsw-2026");
    }

    const sessions = await this.getSessions();
    const updated = sessions.find((session) => session.id === data.id);
    return updated ?? mockRepository.updateSessionWorkspace(sessionId, payload);
  },
  async updateSpeakerProfile(speakerId, payload) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.updateSpeakerProfile(speakerId, payload);

    const { data, error } = await (client
      .from("speakers") as any)
      .update({
        name: payload.name,
        role: payload.role,
        company: payload.company,
        bio: payload.bio,
        avatar: payload.avatar
      })
      .eq("id", speakerId)
      .select("*")
      .single();

    if (error || !data) return mockRepository.updateSpeakerProfile(speakerId, payload);
    return mapSpeakerRow(data);
  },
  async ensureProfileFromAuth({ email, name }) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.ensureProfileFromAuth({ email, name });

    const safeName = name?.trim() || email.split("@")[0] || "Guest Attendee";
    const fallbackProfile = buildFallbackProfile(email, safeName);
    const { data, error } = await (client
      .from("profiles") as any)
      .upsert(
        {
          id: fallbackProfile.id,
          email,
          name: safeName,
          role: "Attendee",
          app_role: "attendee",
          company: fallbackProfile.company,
          bio: fallbackProfile.bio,
          avatar: fallbackProfile.avatar,
          interests: [] as InterestTag[],
          is_discoverable: true,
          visible_contact_fields: ["email"],
          contact_links: { email }
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (error || !data) return fallbackProfile;
    return mapProfileRow(data);
  },
  async updateSponsorProfile(sponsorId, payload) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.updateSponsorProfile(sponsorId, payload);

    const { data, error } = await (client
      .from("sponsors") as any)
      .update({
        description: payload.description,
        track: payload.track,
        tier: payload.tier,
        contact_links: payload.contactLinks
      })
      .eq("id", sponsorId)
      .select("*")
      .single();

    if (error || !data) return mockRepository.updateSponsorProfile(sponsorId, payload);
    return mapSponsorRow(data);
  },
  async getSponsorAnalytics(sponsorId) {
    const client = getSupabaseBrowserClient();
    if (!client) return mockRepository.getSponsorAnalytics(sponsorId);

      const { data, error } = await client
        .from("sponsor_events")
        .select("event_type, created_at, metadata")
        .eq("sponsor_id", sponsorId)
        .order("created_at", { ascending: false });

    if (error || !data) return mockRepository.getSponsorAnalytics(sponsorId);

      const typedEvents = data as SponsorEventRow[];
      const events: SponsorEventRecord[] = typedEvents.map((event) => ({
        eventType: event.event_type,
        createdAt: event.created_at,
        metadata:
          event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
            ? Object.fromEntries(
                Object.entries(event.metadata as Record<string, unknown>).map(([key, value]) => [
                  key,
                  String(value)
                ])
              )
            : {}
      }));

      return {
        sponsorId,
        profileViews: typedEvents.filter((event) => event.event_type === "profile_view").length,
        contactClicks: typedEvents.filter((event) => event.event_type === "contact_click").length,
        sessionViews: typedEvents.filter((event) => event.event_type === "session_view").length,
        mapPinTaps: typedEvents.filter((event) => event.event_type === "map_pin_tap").length,
        ctaClicks: typedEvents.filter((event) => event.event_type === "cta_click").length,
        lastEventAt: typedEvents[0]?.created_at ?? null,
        events
      };
    },
  async logSessionEvent(sessionId, eventType, profileId, metadata) {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    await (client.from("session_events") as any).insert({
      session_id: sessionId,
      profile_id: profileId ?? null,
      event_type: eventType,
      metadata: metadata ?? {}
    } as SessionEventInsert);
  },
  async logSponsorEvent(sponsorId, eventType, profileId, metadata) {
    const client = getSupabaseBrowserClient();
    if (!client) return;

    await (client.from("sponsor_events") as any).insert({
      sponsor_id: sponsorId,
      profile_id: profileId ?? null,
      event_type: eventType,
      metadata: metadata ?? {}
    } as SponsorEventInsert);
  }
};

export function getRepository() {
  return getSupabaseBrowserClient() ? supabaseRepository : mockRepository;
}
