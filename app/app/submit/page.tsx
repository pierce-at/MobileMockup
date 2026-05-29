"use client";

import { useMemo, useState, type FormEvent } from "react";

import type { DayKey, SubmissionResource } from "@/lib/domain/types";
import { useAppState } from "@/lib/state/app-state";

const dayOptions: Array<{ label: string; value: DayKey }> = [
  { label: "Monday", value: "mon" },
  { label: "Tuesday", value: "tue" },
  { label: "Wednesday", value: "wed" },
  { label: "Thursday", value: "thu" },
  { label: "Friday", value: "fri" }
];

const trackOptions = [
  "Operations",
  "Capital",
  "AI",
  "Community",
  "FinTech",
  "Policy",
  "Health",
  "Logistics",
  "Product"
];

const formatOptions = ["Talk", "Panel", "Workshop", "Roundtable", "Demo", "Social"];

function parseSubmissionResources(value: string): SubmissionResource[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [labelPart, urlPart] = entry.split("|").map((part) => part.trim());
      if (!labelPart || !urlPart) return null;
      return { label: labelPart, url: urlPart };
    })
    .filter((entry): entry is SubmissionResource => Boolean(entry));
}

export default function SubmitPage() {
  const { createSubmission, currentUser } = useAppState();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(currentUser.company);
  const [track, setTrack] = useState("Operations");
  const [format, setFormat] = useState("Talk");
  const [summary, setSummary] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [intendedAudience, setIntendedAudience] = useState("");
  const [requestedDay, setRequestedDay] = useState<DayKey>("wed");
  const [themeDraft, setThemeDraft] = useState("Operations, Systems");
  const [speakerDetails, setSpeakerDetails] = useState(
    `${currentUser.name} · ${currentUser.role} at ${currentUser.company}`
  );
  const [logisticsNeeds, setLogisticsNeeds] = useState("");
  const [resourceDraft, setResourceDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const parsedThemes = useMemo(
    () =>
      themeDraft
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    [themeDraft]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const submission = await createSubmission({
      title,
      company,
      track,
      format,
      summary,
      fullDescription,
      intendedAudience,
      themes: parsedThemes,
      speakerDetails,
      logisticsNeeds,
      submissionResources: parseSubmissionResources(resourceDraft),
      requestedDay
    });

    setTitle("");
    setSummary("");
    setFullDescription("");
    setIntendedAudience("");
    setThemeDraft(track);
    setSpeakerDetails(`${currentUser.name} · ${currentUser.role} at ${currentUser.company}`);
    setLogisticsNeeds("");
    setResourceDraft("");
    setMessage(
      `Submission received: ${submission.title}. It is now in ${submission.status.replace("_", " ")} status.`
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Submit session</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Bring a real session into the week.</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">
          This intake now captures the content, audience, speakers, logistics, and links the review board needs to make a real decision.
        </p>
      </div>

      <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Session title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Requested day</span>
              <select
                value={requestedDay}
                onChange={(event) => setRequestedDay(event.target.value as DayKey)}
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
              >
                {dayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Company</span>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                required
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Track</span>
              <select
                value={track}
                onChange={(event) => setTrack(event.target.value)}
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
              >
                {trackOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Format</span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
              >
                {formatOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-midnight">Summary</span>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              required
              className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-midnight">Full description</span>
            <textarea
              value={fullDescription}
              onChange={(event) => setFullDescription(event.target.value)}
              rows={6}
              required
              className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Intended audience</span>
              <textarea
                value={intendedAudience}
                onChange={(event) => setIntendedAudience(event.target.value)}
                rows={3}
                required
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Themes / tags</span>
              <textarea
                value={themeDraft}
                onChange={(event) => setThemeDraft(event.target.value)}
                rows={3}
                required
                placeholder="Operations, Systems, Growth"
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Host / speaker details</span>
              <textarea
                value={speakerDetails}
                onChange={(event) => setSpeakerDetails(event.target.value)}
                rows={4}
                required
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-midnight">Logistics needs</span>
              <textarea
                value={logisticsNeeds}
                onChange={(event) => setLogisticsNeeds(event.target.value)}
                rows={4}
                required
                className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-midnight">Submission resources</span>
            <textarea
              value={resourceDraft}
              onChange={(event) => setResourceDraft(event.target.value)}
              rows={4}
              placeholder="Deck outline | https://example.com/resource"
              className="rounded-[20px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
            />
            <span className="text-xs text-midnight/54">
              One per line. Use `Label | URL`.
            </span>
          </label>

          <button
            type="submit"
            className="rounded-[20px] bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#132b5b]"
          >
            Submit to review queue
          </button>
          {message ? <p className="text-sm text-midnight/68">{message}</p> : null}
        </form>
      </article>
    </section>
  );
}
