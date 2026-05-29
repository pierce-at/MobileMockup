import type {
  AttendeeProfile,
  ContactField,
  InterestTag,
  ScheduleControl,
  Session,
  SessionSubmission,
  Speaker,
  Sponsor,
  Venue
} from "@/lib/domain/types";
import type { Database } from "@/lib/supabase/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type VenueRow = Database["public"]["Tables"]["venues"]["Row"];
type SponsorRow = Database["public"]["Tables"]["sponsors"]["Row"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];
type SpeakerRow = Database["public"]["Tables"]["speakers"]["Row"];
type SubmissionRow = Database["public"]["Tables"]["session_submissions"]["Row"];
type ScheduleControlRow = Database["public"]["Tables"]["schedule_controls"]["Row"];

function normalizeContactLinks(value: Database["public"]["Tables"]["profiles"]["Row"]["contact_links"]) {
  return (value ?? {}) as Partial<Record<ContactField, string>>;
}

export function mapProfileRow(row: ProfileRow): AttendeeProfile {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    appRole: row.app_role,
    company: row.company,
    bio: row.bio,
    avatar: row.avatar,
    interests: (row.interests ?? []) as InterestTag[],
    isDiscoverable: row.is_discoverable,
    visibleContactFields: row.visible_contact_fields as ContactField[],
    contactLinks: normalizeContactLinks(row.contact_links),
    email: row.email ?? undefined,
    sponsorId: row.sponsor_id ?? undefined
  };
}

export function mapVenueRow(row: VenueRow): Venue {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    campus: row.campus ?? undefined,
    transitNotes: row.transit_notes ?? undefined,
    parkingNotes: row.parking_notes ?? undefined,
    accessibilityNotes: row.accessibility_notes ?? undefined,
    mapLink: row.map_link ?? undefined
  };
}

export function mapSponsorRow(row: SponsorRow): Sponsor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tier: row.tier,
    track: row.track ?? undefined,
    description: row.description,
    logo: row.logo,
    contactLinks: (row.contact_links ?? {}) as Partial<Record<ContactField, string>>,
    featuredSessionIds: row.featured_session_ids
  };
}

export function mapSessionRow(
  row: SessionRow,
  speakersById: Map<string, Speaker>
): Session {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    venueId: row.venue_id,
    room: row.room,
    format: row.format ?? undefined,
    audience: row.audience ?? undefined,
    speakers: row.speaker_ids.map((speakerId) => speakersById.get(speakerId)).filter(Boolean) as Speaker[],
    sponsorId: row.sponsor_id ?? undefined,
    tags: row.tags,
    isFeatured: row.is_featured,
    isSponsored: row.is_sponsored,
    capacity: row.capacity ?? undefined,
    attendeeCount: row.attendee_count,
    ownerProfileId: row.owner_profile_id ?? undefined,
    sourceSubmissionId: row.source_submission_id ?? undefined,
    logisticsNotes: row.logistics_notes ?? undefined,
    hostNotes: row.host_notes ?? undefined,
    externalRegistrationUrl: row.external_registration_url ?? undefined,
    publishedAt: row.published_at ?? undefined,
    lastScheduleChangeAt: row.last_schedule_change_at ?? undefined,
    updatedAt: row.updated_at ?? row.created_at ?? undefined
  };
}

export function mapSpeakerRow(row: SpeakerRow): Speaker {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    company: row.company,
    bio: row.bio,
    avatar: row.avatar,
    email: row.email ?? undefined,
    profileId: row.profile_id ?? undefined,
    updatedAt: row.updated_at ?? row.created_at ?? undefined
  };
}

export function mapSubmissionRow(row: SubmissionRow): SessionSubmission {
  return {
    id: row.id,
    title: row.title,
    submitterName: row.submitter_name,
    submitterEmail: row.submitter_email,
    submitterProfileId: row.submitter_profile_id ?? undefined,
    company: row.company,
    track: row.track,
    format: row.format,
    summary: row.summary,
    fullDescription: row.full_description,
    intendedAudience: row.intended_audience,
    themes: row.themes ?? [],
    speakerDetails: row.speaker_details,
    logisticsNeeds: row.logistics_needs,
    submissionResources: Array.isArray(row.submission_resources)
      ? (row.submission_resources as Array<{ label?: string; url?: string }>)
          .filter((entry) => typeof entry?.label === "string" && typeof entry?.url === "string")
          .map((entry) => ({ label: entry.label as string, url: entry.url as string }))
      : [],
    requestedDay: row.requested_day ?? undefined,
    status: row.status,
    internalNotes: row.internal_notes,
    decisionNote: row.decision_note,
    assignedReviewer: row.assigned_reviewer ?? undefined,
    lastReviewedAt: row.last_reviewed_at ?? undefined,
    linkedSessionId: row.linked_session_id ?? undefined,
    createdAt: row.created_at
  };
}

export function mapScheduleControlRow(row: ScheduleControlRow): ScheduleControl {
  return {
    id: row.id,
    isPublished: row.is_published,
    lockedAt: row.locked_at,
    publishedAt: row.published_at,
    announcement: row.announcement,
    releaseVersion: row.release_version,
    hasUnpublishedChanges: row.has_unpublished_changes,
    lastPublishedBy: row.last_published_by,
    lastEditedAt: row.last_edited_at
  };
}
