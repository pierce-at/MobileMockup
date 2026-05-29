"use client";

import { useEffect, useMemo, useState } from "react";

import type { SessionSubmission, SubmissionStatus } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

const statusOptions: SubmissionStatus[] = [
  "submitted",
  "needs_info",
  "in_review",
  "approved",
  "rejected",
  "scheduled"
];

const statusTone: Record<SubmissionStatus, string> = {
  submitted: "bg-[rgba(10,24,56,0.08)] text-midnight",
  needs_info: "bg-[rgba(220,98,64,0.14)] text-coral",
  in_review: "bg-[rgba(245,200,66,0.2)] text-midnight",
  approved: "bg-[rgba(53,143,95,0.16)] text-[#215b3c]",
  rejected: "bg-[rgba(220,98,64,0.14)] text-coral",
  scheduled: "bg-[rgba(22,85,140,0.16)] text-[#17456f]"
};

function buildDefaultReviewState(submission: SessionSubmission | undefined) {
  return {
    internalNotes: submission?.internalNotes ?? "",
    decisionNote: submission?.decisionNote ?? "",
    assignedReviewer: submission?.assignedReviewer ?? "",
    linkedSessionId: submission?.linkedSessionId ?? ""
  };
}

export default function AdminPage() {
  const {
    auditLogs,
    currentUser,
    scheduleChanges,
    sessions,
    sponsors,
    venues,
    profiles,
    submissions,
    scheduleControl,
    volunteerAssignments,
    updateScheduleControl,
    updateSubmissionReview
  } = useAppState();
  const [selectedId, setSelectedId] = useState(submissions[0]?.id ?? "");
  const selectedSubmission =
    submissions.find((submission) => submission.id === selectedId) ?? submissions[0];
  const [reviewState, setReviewState] = useState(buildDefaultReviewState(selectedSubmission));

  const isAdmin = currentUser.appRole === "admin";

  useEffect(() => {
    setReviewState(buildDefaultReviewState(selectedSubmission));
  }, [selectedSubmission]);

  const cards = [
    { label: "Sessions", value: sessions.length, hint: "Scheduled and draft-linked" },
    { label: "Sponsors", value: sponsors.length, hint: "Partner surfaces" },
    { label: "Venues", value: venues.length, hint: "Map nodes" },
    { label: "Profiles", value: profiles.length, hint: "Role-bearing accounts" },
    { label: "Volunteer shifts", value: volunteerAssignments.length, hint: "Coverage status" },
    { label: "Draft changes", value: scheduleChanges.filter((change) => !change.isPublished).length, hint: "Waiting on release" }
  ];

  const counts = useMemo(
    () =>
      statusOptions.map((status) => ({
        status,
        count: submissions.filter((submission) => submission.status === status).length
      })),
    [submissions]
  );

  async function setStatus(status: SubmissionStatus) {
    if (!selectedSubmission || !isAdmin) return;
    await updateSubmissionReview(selectedSubmission.id, {
      status,
      internalNotes: reviewState.internalNotes,
      decisionNote: reviewState.decisionNote,
      assignedReviewer: reviewState.assignedReviewer,
      linkedSessionId: reviewState.linkedSessionId || null
    });
  }

  async function saveReviewFields() {
    if (!selectedSubmission || !isAdmin) return;
    await updateSubmissionReview(selectedSubmission.id, {
      internalNotes: reviewState.internalNotes,
      decisionNote: reviewState.decisionNote,
      assignedReviewer: reviewState.assignedReviewer,
      linkedSessionId: reviewState.linkedSessionId || null
    });
  }

  async function togglePublish() {
    if (!isAdmin) return;
    const nextPublished = !scheduleControl.isPublished;
    const timestamp = new Date().toISOString();

    await updateScheduleControl({
      isPublished: nextPublished,
      publishedAt: nextPublished ? timestamp : null,
      lockedAt: nextPublished ? timestamp : null
    });
  }

  async function toggleLock() {
    if (!isAdmin) return;
    await updateScheduleControl({
      lockedAt: scheduleControl.lockedAt ? null : new Date().toISOString()
    });
  }

  function exportCsv(filename: string, rows: Array<Record<string, string | number>>) {
    const headers = Object.keys(rows[0] ?? {});
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Admin console</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Editorial and publish control</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
          Intake review, approval-to-session linkage, and schedule release control now live in one operating surface.
        </p>
      </div>

      {!isAdmin ? (
        <div className="rounded-[24px] border border-coral/18 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Read only</p>
          <p className="mt-2 font-display text-2xl font-semibold text-midnight">
            This surface is reserved for admin reviewers.
          </p>
          <p className="mt-2 text-sm leading-6 text-midnight/68">
            You can inspect the current pipeline here, but only admin accounts can change review state or publish controls.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card"
          >
            <p className="text-xs uppercase tracking-[0.24em] text-coral">{card.label}</p>
            <p className="mt-3 font-display text-4xl font-semibold text-midnight">{card.value}</p>
            <p className="mt-2 text-sm text-midnight/64">{card.hint}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Schedule control</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-midnight">
                Publish rail
              </h2>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                scheduleControl.isPublished
                  ? "bg-[rgba(53,143,95,0.16)] text-[#215b3c]"
                  : "bg-[rgba(10,24,56,0.08)] text-midnight"
              }`}
            >
              {scheduleControl.isPublished ? "Live" : "Draft"}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-midnight/70">
            {scheduleControl.announcement}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-midnight/45">Published</p>
              <p className="mt-2 font-display text-lg font-semibold text-midnight">
                {scheduleControl.publishedAt
                  ? new Date(scheduleControl.publishedAt).toLocaleString()
                  : "Not published yet"}
              </p>
            </div>
            <div className="rounded-[22px] bg-mist p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-midnight/45">Locked</p>
              <p className="mt-2 font-display text-lg font-semibold text-midnight">
                {scheduleControl.lockedAt
                  ? new Date(scheduleControl.lockedAt).toLocaleString()
                  : "Unlocked"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void togglePublish()}
              disabled={!isAdmin}
              className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              {scheduleControl.isPublished ? "Unpublish schedule" : "Publish schedule"}
            </button>
            <button
              type="button"
              onClick={() => void toggleLock()}
              disabled={!isAdmin}
              className="rounded-full border border-midnight/12 px-5 py-3 text-sm font-semibold text-midnight disabled:cursor-not-allowed disabled:opacity-55"
            >
              {scheduleControl.lockedAt ? "Unlock edits" : "Lock edits"}
            </button>
            <button
              type="button"
              onClick={() =>
                exportCsv(
                  "tcsw-release-summary.csv",
                  scheduleChanges.map((change) => ({
                    sessionId: change.sessionId,
                    type: change.changeType,
                    summary: change.summary,
                    releaseVersion: change.releaseVersion,
                    published: change.isPublished ? "yes" : "no"
                  }))
                )
              }
              className="rounded-full border border-midnight/12 px-5 py-3 text-sm font-semibold text-midnight"
            >
              Export release CSV
            </button>
          </div>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Submission funnel</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {counts.map((entry) => (
              <span
                key={entry.status}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${statusTone[entry.status]}`}
              >
                {entry.status.replace("_", " ")}: {entry.count}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[0.82fr,1.18fr]">
            <div className="grid gap-3">
              {submissions.map((submission) => (
                <button
                  key={submission.id}
                  type="button"
                  onClick={() => setSelectedId(submission.id)}
                  className={`rounded-[22px] border px-4 py-4 text-left transition ${
                    selectedSubmission?.id === submission.id
                      ? "border-midnight bg-mist"
                      : "border-midnight/8 bg-white hover:border-midnight/16"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-xl font-semibold text-midnight">
                        {submission.title}
                      </p>
                      <p className="mt-1 text-sm text-midnight/64">
                        {submission.submitterName} · {submission.company}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[submission.status]}`}
                    >
                      {submission.status.replace("_", " ")}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedSubmission ? (
              <div className="rounded-[24px] bg-mist p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-coral">Selected submission</p>
                <h3 className="mt-2 font-display text-3xl font-semibold text-midnight">
                  {selectedSubmission.title}
                </h3>
                <p className="mt-2 text-sm text-midnight/68">
                  {selectedSubmission.submitterName} · {selectedSubmission.submitterEmail}
                </p>
                <div className="mt-4 grid gap-2 text-sm text-midnight/72 md:grid-cols-3">
                  <p>Track: {selectedSubmission.track}</p>
                  <p>Format: {selectedSubmission.format}</p>
                  <p>Requested day: {selectedSubmission.requestedDay?.toUpperCase() ?? "Open"}</p>
                </div>

                <div className="mt-4 space-y-4 rounded-[20px] bg-white/80 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Summary</p>
                    <p className="mt-2 text-sm leading-6 text-midnight/76">
                      {selectedSubmission.summary}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Full description</p>
                    <p className="mt-2 text-sm leading-6 text-midnight/76">
                      {selectedSubmission.fullDescription}
                    </p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Audience</p>
                      <p className="mt-2 text-sm leading-6 text-midnight/76">
                        {selectedSubmission.intendedAudience}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Themes</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedSubmission.themes.map((theme) => (
                          <span
                            key={theme}
                            className="rounded-full bg-[rgba(10,24,56,0.08)] px-3 py-1 text-xs font-semibold text-midnight"
                          >
                            {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Speakers</p>
                    <p className="mt-2 text-sm leading-6 text-midnight/76">
                      {selectedSubmission.speakerDetails}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Logistics needs</p>
                    <p className="mt-2 text-sm leading-6 text-midnight/76">
                      {selectedSubmission.logisticsNeeds}
                    </p>
                  </div>
                  {selectedSubmission.submissionResources.length ? (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-midnight/45">Resources</p>
                      <div className="mt-2 grid gap-2">
                        {selectedSubmission.submissionResources.map((resource) => (
                          <a
                            key={`${resource.label}-${resource.url}`}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-[14px] border border-midnight/8 bg-mist px-3 py-2 text-sm font-semibold text-midnight"
                          >
                            {resource.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void setStatus(status)}
                      disabled={!isAdmin}
                      className={`rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-55 ${statusTone[status]}`}
                    >
                      Mark {status.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-midnight">Assigned reviewer</span>
                    <input
                      value={reviewState.assignedReviewer}
                      onChange={(event) =>
                        setReviewState((current) => ({
                          ...current,
                          assignedReviewer: event.target.value
                        }))
                      }
                      className="rounded-[20px] border border-midnight/10 bg-white px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-midnight">Linked session</span>
                    <select
                      value={reviewState.linkedSessionId}
                      onChange={(event) =>
                        setReviewState((current) => ({
                          ...current,
                          linkedSessionId: event.target.value
                        }))
                      }
                      className="rounded-[20px] border border-midnight/10 bg-white px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                    >
                      <option value="">Create draft session on approval</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.title}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label htmlFor="reviewer-internal-notes" className="mt-5 grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Internal notes</span>
                  <textarea
                    id="reviewer-internal-notes"
                    value={reviewState.internalNotes}
                    onChange={(event) =>
                      setReviewState((current) => ({
                        ...current,
                        internalNotes: event.target.value
                      }))
                    }
                    rows={5}
                    className="rounded-[20px] border border-midnight/10 bg-white px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <label htmlFor="reviewer-decision-note" className="mt-5 grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Decision note</span>
                  <textarea
                    id="reviewer-decision-note"
                    value={reviewState.decisionNote}
                    onChange={(event) =>
                      setReviewState((current) => ({
                        ...current,
                        decisionNote: event.target.value
                      }))
                    }
                    rows={4}
                    className="rounded-[20px] border border-midnight/10 bg-white px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveReviewFields()}
                    disabled={!isAdmin}
                    className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    Save review fields
                  </button>
                  {selectedSubmission.lastReviewedAt ? (
                    <p className="self-center text-sm text-midnight/62">
                      Last reviewed {new Date(selectedSubmission.lastReviewedAt).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Release summary</p>
          <div className="mt-4 grid gap-3">
            {scheduleChanges.slice(0, 6).map((change) => {
              const session = sessions.find((item) => item.id === change.sessionId);
              return (
                <div key={change.id} className="rounded-[22px] bg-mist p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xl font-semibold text-midnight">
                      {session?.title ?? change.sessionId}
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-midnight/60">
                      {change.isPublished ? `Live v${change.releaseVersion}` : "Draft"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-midnight/70">{change.summary}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Ops hardening</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-midnight">Audit trail</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                exportCsv(
                  "tcsw-audit-log.csv",
                  auditLogs.map((entry) => ({
                    actor: entry.actor,
                    action: entry.action,
                    subject: entry.subject,
                    createdAt: entry.createdAt
                  }))
                )
              }
              className="rounded-full border border-midnight/12 px-4 py-2 text-sm font-semibold text-midnight"
            >
              Export audit CSV
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {auditLogs.map((entry) => (
              <div key={entry.id} className="rounded-[22px] bg-mist p-4">
                <p className="font-display text-xl font-semibold text-midnight">{entry.action}</p>
                <p className="mt-2 text-sm text-midnight/68">
                  {entry.actor} · {entry.subject}
                </p>
                <p className="mt-2 text-xs text-midnight/52">
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
        <p className="text-xs uppercase tracking-[0.24em] text-coral">Volunteer coverage</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {volunteerAssignments.map((assignment) => {
            const venue = venues.find((item) => item.id === assignment.venueId);
            return (
              <div key={assignment.id} className="rounded-[22px] bg-mist p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl font-semibold text-midnight">
                    {assignment.assignedRole ?? assignment.requestedRole}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-midnight/60">
                    {assignment.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-midnight/68">
                  {assignment.name} · {assignment.day.toUpperCase()} · {assignment.startTime} - {assignment.endTime}
                </p>
                {venue ? (
                  <p className="mt-2 text-sm leading-6 text-midnight/70">{venue.name}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
