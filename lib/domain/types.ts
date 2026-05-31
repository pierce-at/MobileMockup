export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri";

export type ContactField = "email" | "linkedin" | "website";
export type InterestTag =
  | "AI"
  | "FinTech"
  | "Community"
  | "Social"
  | "Capital"
  | "Operations"
  | "Policy"
  | "Growth"
  | "Product"
  | "Climate"
  | "Logistics"
  | "Demo"
  | "People"
  | "Health"
  | "Systems";

export type AppRole = "attendee" | "speaker" | "sponsor" | "host" | "admin";

export type SubmissionStatus =
  | "submitted"
  | "needs_info"
  | "in_review"
  | "approved"
  | "rejected"
  | "scheduled";

export type SubmissionResource = {
  label: string;
  url: string;
};

export type AttachmentOwnerType = "session" | "sponsor";
export type AttachmentKind = "file" | "link";
export type AttachmentVisibility = "public" | "internal";

export type Attachment = {
  id: string;
  ownerType: AttachmentOwnerType;
  ownerId: string;
  title: string;
  kind: AttachmentKind;
  url: string;
  fileName?: string;
  mimeType?: string;
  visibility: AttachmentVisibility;
  featured?: boolean;
  uploadedBy?: string;
  createdAt: string;
};

export type ScheduleChangeType =
  | "time"
  | "venue"
  | "room"
  | "title"
  | "description"
  | "status"
  | "materials";

export type ScheduleChange = {
  id: string;
  sessionId: string;
  releaseVersion: number;
  changeType: ScheduleChangeType;
  summary: string;
  isPublished: boolean;
  createdAt: string;
  createdBy?: string;
};

export type VolunteerStatus = "requested" | "assigned" | "confirmed" | "completed";

export type VolunteerAssignment = {
  id: string;
  profileId?: string;
  name: string;
  email: string;
  requestedRole: string;
  assignedRole?: string;
  venueId?: string;
  day: DayKey;
  startTime: string;
  endTime: string;
  notes?: string;
  status: VolunteerStatus;
};

export type NotificationType =
  | "schedule_update"
  | "publish"
  | "volunteer_assignment"
  | "submission_status"
  | "sponsor_fulfillment";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  actionHref?: string;
};

export type SponsorFulfillmentStatus = "pending" | "met" | "exceeded";

export type SponsorFulfillmentItem = {
  id: string;
  sponsorId: string;
  label: string;
  detail: string;
  status: SponsorFulfillmentStatus;
  proof?: string;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  subject: string;
  createdAt: string;
};

export type Speaker = {
  id: string;
  name: string;
  role: string;
  company: string;
  bio: string;
  avatar: string;
  email?: string;
  profileId?: string;
  updatedAt?: string;
};

export type Venue = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  campus?: string;
  transitNotes?: string;
  parkingNotes?: string;
  accessibilityNotes?: string;
  mapLink?: string;
};

export type Sponsor = {
  id: string;
  slug: string;
  name: string;
  tier: string;
  track?: string;
  description: string;
  logo: string;
  contactLinks: Partial<Record<ContactField, string>>;
  featuredSessionIds: string[];
};

export type SponsorEventType =
  | "profile_view"
  | "contact_click"
  | "session_view"
  | "map_pin_tap"
  | "cta_click";
export type SessionEventType = "detail_view" | "save" | "remove";

export type SponsorAnalytics = {
  sponsorId: string;
  profileViews: number;
  contactClicks: number;
  sessionViews: number;
  mapPinTaps: number;
  ctaClicks: number;
  lastEventAt: string | null;
  events: SponsorEventRecord[];
};

export type SponsorEventRecord = {
  eventType: SponsorEventType;
  createdAt: string;
  metadata: Record<string, string>;
};

export type SessionSubmission = {
  id: string;
  title: string;
  submitterName: string;
  submitterEmail: string;
  submitterProfileId?: string;
  company: string;
  track: string;
  format: string;
  summary: string;
  fullDescription: string;
  intendedAudience: string;
  themes: string[];
  speakerDetails: string;
  logisticsNeeds: string;
  submissionResources: SubmissionResource[];
  requestedDay?: DayKey;
  status: SubmissionStatus;
  internalNotes: string;
  decisionNote: string;
  assignedReviewer?: string;
  lastReviewedAt?: string;
  linkedSessionId?: string;
  createdAt: string;
};

export type ScheduleControl = {
  id: string;
  isPublished: boolean;
  lockedAt: string | null;
  publishedAt: string | null;
  announcement: string;
  releaseVersion: number;
  hasUnpublishedChanges: boolean;
  lastPublishedBy?: string | null;
  lastEditedAt?: string | null;
};

export type Session = {
  id: string;
  slug: string;
  title: string;
  description: string;
  day: DayKey;
  startTime: string;
  endTime: string;
  venueId: string;
  room: string;
  format?: string;
  audience?: string;
  speakers: Speaker[];
  sponsorId?: string;
  tags: string[];
  isFeatured: boolean;
  isSponsored: boolean;
  capacity?: number;
  attendeeCount: number;
  ownerProfileId?: string;
  sourceSubmissionId?: string;
  logisticsNotes?: string;
  hostNotes?: string;
  externalRegistrationUrl?: string;
  publishedAt?: string;
  lastScheduleChangeAt?: string;
  updatedAt?: string;
};

export type AttendeeProfile = {
  id: string;
  name: string;
  role: string;
  appRole: AppRole;
  company: string;
  bio: string;
  avatar: string;
  interests: InterestTag[];
  isDiscoverable: boolean;
  visibleContactFields: ContactField[];
  contactLinks: Partial<Record<ContactField, string>>;
  email?: string;
  sponsorId?: string;
};

export type SavedScheduleEntry = {
  sessionId: string;
  savedAt: string;
};

export type PersistedPreferences = {
  savedSchedule: SavedScheduleEntry[];
  currentUserDiscoverable: boolean;
  currentUserVisibleContactFields: ContactField[];
  currentUserInterests: InterestTag[];
};

export type AppState = {
  currentUser: AttendeeProfile;
  savedSchedule: SavedScheduleEntry[];
  profiles: AttendeeProfile[];
  sessions: Session[];
  venues: Venue[];
  sponsors: Sponsor[];
  submissions: SessionSubmission[];
  scheduleControl: ScheduleControl;
  attachments: Attachment[];
  scheduleChanges: ScheduleChange[];
  volunteerAssignments: VolunteerAssignment[];
  notifications: NotificationItem[];
  sponsorFulfillment: SponsorFulfillmentItem[];
  auditLogs: AuditLog[];
};

export type ProfilePreferencesUpdate = {
  isDiscoverable?: boolean;
  visibleContactFields?: ContactField[];
  interests?: InterestTag[];
};

export type SponsorProfileUpdate = {
  description?: string;
  track?: string;
  tier?: string;
  contactLinks?: Partial<Record<ContactField, string>>;
};

export type SubmissionReviewUpdate = {
  status?: SubmissionStatus;
  internalNotes?: string;
  decisionNote?: string;
  assignedReviewer?: string;
  linkedSessionId?: string | null;
};

export type AttachmentCreateInput = {
  ownerType: AttachmentOwnerType;
  ownerId: string;
  title: string;
  kind: AttachmentKind;
  url: string;
  fileName?: string;
  mimeType?: string;
  visibility: AttachmentVisibility;
  featured?: boolean;
};

export type VolunteerAssignmentCreateInput = {
  name: string;
  email: string;
  requestedRole: string;
  day: DayKey;
  startTime: string;
  endTime: string;
  notes?: string;
};

export type SessionWorkspaceUpdate = {
  title?: string;
  description?: string;
  room?: string;
  logisticsNotes?: string;
  hostNotes?: string;
};

export type SessionSubmissionCreateInput = {
  title: string;
  company: string;
  track: string;
  format: string;
  summary: string;
  fullDescription: string;
  intendedAudience: string;
  themes: string[];
  speakerDetails: string;
  logisticsNeeds: string;
  submissionResources: SubmissionResource[];
  requestedDay?: DayKey;
};

export type SpeakerProfileUpdate = {
  name?: string;
  role?: string;
  company?: string;
  bio?: string;
  avatar?: string;
};

export type AuthStatus = "guest" | "authenticated";

export type AuthSummary = {
  status: AuthStatus;
  email: string | null;
};
