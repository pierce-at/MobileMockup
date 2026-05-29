import type { InterestTag, SavedScheduleEntry, Session } from "@/lib/domain/types";

export function getRecommendedSessions(
  sessions: Session[],
  savedSchedule: SavedScheduleEntry[],
  interests: InterestTag[] = [],
  limit = 3
) {
  const savedIds = new Set(savedSchedule.map((entry) => entry.sessionId));
  const savedSessions = sessions.filter((session) => savedIds.has(session.id));
  const tagWeights = new Map<string, number>();

  interests.forEach((interest) => {
    tagWeights.set(interest, (tagWeights.get(interest) ?? 0) + 3);
  });

  savedSessions.forEach((session) => {
    session.tags.forEach((tag) => {
      tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + 1);
    });
  });

  const ranked = sessions
    .filter((session) => !savedIds.has(session.id))
    .map((session) => ({
      session,
      score:
        session.tags.reduce((sum, tag) => sum + (tagWeights.get(tag) ?? 0), 0) +
        (session.isFeatured ? 0.25 : 0) +
        (session.isSponsored ? 0.1 : 0)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.session);

  if (ranked.length) return ranked;

  return sessions
    .filter((session) => !savedIds.has(session.id))
    .sort((left, right) => {
      if (left.isFeatured !== right.isFeatured) {
        return Number(right.isFeatured) - Number(left.isFeatured);
      }

      if (left.isSponsored !== right.isSponsored) {
        return Number(right.isSponsored) - Number(left.isSponsored);
      }

      return right.attendeeCount - left.attendeeCount;
    })
    .slice(0, limit);
}
