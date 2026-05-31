"use client";

import { useEffect, useMemo, useState } from "react";

import { useAppState } from "@/lib/state/app-state";

export default function WorkspacePage() {
  const {
    currentUser,
    attachments,
    createAttachment,
    deleteAttachment,
    getOwnedSessions,
    getOwnedSpeakers,
    updateSessionWorkspace,
    updateSpeakerProfile
  } = useAppState();
  const ownedSessions = getOwnedSessions();
  const ownedSpeakerIds = useMemo(
    () => new Set(getOwnedSpeakers().map((speaker) => speaker.id)),
    [getOwnedSpeakers]
  );
  const [selectedId, setSelectedId] = useState(ownedSessions[0]?.id ?? "");
  const selectedSession =
    ownedSessions.find((session) => session.id === selectedId) ?? ownedSessions[0];
  const speakerOptions = useMemo(
    () =>
      selectedSession?.speakers.map((speaker) => ({
        ...speaker,
        editable: ownedSpeakerIds.has(speaker.id) || selectedSession.ownerProfileId === currentUser.id
      })) ?? [],
    [currentUser.id, ownedSpeakerIds, selectedSession]
  );
  const [selectedSpeakerId, setSelectedSpeakerId] = useState(speakerOptions[0]?.id ?? "");
  const selectedSpeaker =
    speakerOptions.find((speaker) => speaker.id === selectedSpeakerId) ?? speakerOptions[0];
  const [title, setTitle] = useState(selectedSession?.title ?? "");
  const [description, setDescription] = useState(selectedSession?.description ?? "");
  const [room, setRoom] = useState(selectedSession?.room ?? "");
  const [logisticsNotes, setLogisticsNotes] = useState(selectedSession?.logisticsNotes ?? "");
  const [hostNotes, setHostNotes] = useState(selectedSession?.hostNotes ?? "");
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialUrl, setMaterialUrl] = useState("");
  const [speakerName, setSpeakerName] = useState(selectedSpeaker?.name ?? "");
  const [speakerRole, setSpeakerRole] = useState(selectedSpeaker?.role ?? "");
  const [speakerCompany, setSpeakerCompany] = useState(selectedSpeaker?.company ?? "");
  const [speakerBio, setSpeakerBio] = useState(selectedSpeaker?.bio ?? "");
  const [speakerAvatar, setSpeakerAvatar] = useState(selectedSpeaker?.avatar ?? "");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedSession) return;
    setTitle(selectedSession.title);
    setDescription(selectedSession.description);
    setRoom(selectedSession.room);
    setLogisticsNotes(selectedSession.logisticsNotes ?? "");
    setHostNotes(selectedSession.hostNotes ?? "");
  }, [selectedSession]);

  const sessionAttachments = selectedSession
    ? attachments.filter((attachment) => attachment.ownerType === "session" && attachment.ownerId === selectedSession.id)
    : [];
  const totalMaterials = ownedSessions.reduce(
    (count, session) =>
      count +
      attachments.filter((attachment) => attachment.ownerType === "session" && attachment.ownerId === session.id)
        .length,
    0
  );
  const sessionsWithLogistics = ownedSessions.filter((session) => session.logisticsNotes?.trim()).length;

  useEffect(() => {
    setSelectedSpeakerId(speakerOptions[0]?.id ?? "");
  }, [selectedSession?.id, speakerOptions]);

  useEffect(() => {
    if (!selectedSpeaker) return;
    setSpeakerName(selectedSpeaker.name);
    setSpeakerRole(selectedSpeaker.role);
    setSpeakerCompany(selectedSpeaker.company);
    setSpeakerBio(selectedSpeaker.bio);
    setSpeakerAvatar(selectedSpeaker.avatar);
  }, [selectedSpeaker]);

  async function saveWorkspace() {
    if (!selectedSession) return;

    await updateSessionWorkspace(selectedSession.id, {
      title,
      description,
      logisticsNotes,
      hostNotes
    });

    setMessage("Session workspace updated.");
  }

  async function addMaterial() {
    if (!selectedSession || !materialTitle || !materialUrl) return;
    await createAttachment({
      ownerType: "session",
      ownerId: selectedSession.id,
      title: materialTitle,
      kind: "link",
      url: materialUrl,
      visibility: "public"
    });
    setMaterialTitle("");
    setMaterialUrl("");
    setMessage("Session material added.");
  }

  async function saveSpeaker() {
    if (!selectedSpeaker || !selectedSpeaker.editable) return;

    await updateSpeakerProfile(selectedSpeaker.id, {
      name: speakerName,
      role: speakerRole,
      company: speakerCompany,
      bio: speakerBio,
      avatar: speakerAvatar
    });

    setMessage("Speaker card updated.");
  }

  if (!ownedSessions.length) {
    return (
      <section className="space-y-6">
        <div className="rounded-[18px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-6 text-white shadow-card">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Workspace</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Speaker desk</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
            No owned sessions are linked to {currentUser.name} yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[18px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Workspace</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">
          {currentUser.appRole === "speaker" ? "Speaker desk" : "Session owner desk"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
          Tighten copy, confirm room details, add materials, and hand ops what they need before schedule lock.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.22em] text-coral">Owned sessions</p>
          <p className="mt-3 font-display text-4xl font-semibold text-midnight">{ownedSessions.length}</p>
          <p className="mt-2 text-sm text-midnight/64">Talks, panels, or workshops linked to this profile.</p>
        </article>
        <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.22em] text-coral">Materials</p>
          <p className="mt-3 font-display text-4xl font-semibold text-midnight">{totalMaterials}</p>
          <p className="mt-2 text-sm text-midnight/64">Links added for slides, prep docs, or attendee follow-up.</p>
        </article>
        <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.22em] text-coral">Ops notes</p>
          <p className="mt-3 font-display text-4xl font-semibold text-midnight">{sessionsWithLogistics}</p>
          <p className="mt-2 text-sm text-midnight/64">Sessions with AV, mic, room, or handoff details captured.</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.78fr,1.22fr]">
        <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Owned sessions</p>
          <div className="mt-4 grid gap-3">
            {ownedSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => {
                  setSelectedId(session.id);
                  setMessage(null);
                }}
                className={`rounded-[12px] border px-4 py-4 text-left transition ${
                  selectedSession?.id === session.id
                    ? "border-midnight bg-mist"
                    : "border-midnight/8 bg-white hover:border-midnight/16"
                }`}
              >
                <p className="font-display text-xl font-semibold text-midnight">{session.title}</p>
                <p className="mt-2 text-sm text-midnight/64">
                  {session.day.toUpperCase()} - {session.startTime} - {session.room}
                </p>
              </button>
            ))}
          </div>
        </article>

        {selectedSession ? (
          <div className="grid gap-4">
            <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Editable session surface</p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Session title</span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Public description</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={6}
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Room / location label</span>
                  <input
                    value={room}
                    readOnly
                    className="rounded-[10px] border border-midnight/10 bg-mist px-4 py-3 text-sm text-midnight/62 outline-none"
                  />
                  <span className="text-xs text-midnight/52">
                    Locked for hosts. Admin controls time and location.
                  </span>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Logistics notes</span>
                  <textarea
                    value={logisticsNotes}
                    onChange={(event) => setLogisticsNotes(event.target.value)}
                    rows={4}
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-midnight">Host notes</span>
                  <textarea
                    value={hostNotes}
                    onChange={(event) => setHostNotes(event.target.value)}
                    rows={4}
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => void saveWorkspace()}
                  className="rounded-[10px] bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0e5a70]"
                >
                  Save workspace changes
                </button>
              </div>
            </article>

            <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Session materials</p>
              <div className="mt-4 grid gap-3">
                <div className="grid gap-3 md:grid-cols-[0.9fr,1.1fr,auto]">
                  <input
                    value={materialTitle}
                    onChange={(event) => setMaterialTitle(event.target.value)}
                    placeholder="Resource title"
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                  />
                  <input
                    value={materialUrl}
                    onChange={(event) => setMaterialUrl(event.target.value)}
                    placeholder="https://example.com/resource"
                    className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                  />
                  <button
                    type="button"
                    onClick={() => void addMaterial()}
                    className="rounded-[10px] bg-midnight px-4 py-3 text-sm font-semibold text-white"
                  >
                    Add
                  </button>
                </div>

                {sessionAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-[18px] bg-mist px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-midnight">{attachment.title}</p>
                      <p className="truncate text-xs text-midnight/52">{attachment.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteAttachment(attachment.id)}
                      className="rounded-full border border-midnight/10 px-3 py-1 text-[11px] font-semibold text-midnight/68"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
              <p className="text-xs uppercase tracking-[0.24em] text-coral">Speaker card editor</p>
              {speakerOptions.length ? (
                <div className="mt-4 grid gap-4">
                  <div className="flex flex-wrap gap-2">
                    {speakerOptions.map((speaker) => (
                      <button
                        key={speaker.id}
                        type="button"
                        onClick={() => {
                          setSelectedSpeakerId(speaker.id);
                          setMessage(null);
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          selectedSpeaker?.id === speaker.id
                            ? "bg-midnight text-white"
                            : "bg-mist text-midnight"
                        }`}
                      >
                        {speaker.name}
                      </button>
                    ))}
                  </div>

                  {selectedSpeaker ? (
                    <>
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-midnight">Name</span>
                        <input
                          value={speakerName}
                          onChange={(event) => setSpeakerName(event.target.value)}
                          className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                        />
                      </label>

                      <div className="grid gap-4 md:grid-cols-3">
                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-midnight">Role</span>
                          <input
                            value={speakerRole}
                            onChange={(event) => setSpeakerRole(event.target.value)}
                            className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-midnight">Company</span>
                          <input
                            value={speakerCompany}
                            onChange={(event) => setSpeakerCompany(event.target.value)}
                            className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                          />
                        </label>
                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-midnight">Avatar</span>
                          <input
                            value={speakerAvatar}
                            onChange={(event) => setSpeakerAvatar(event.target.value)}
                            maxLength={2}
                            className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm text-midnight outline-none focus:border-midnight/24"
                          />
                        </label>
                      </div>

                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-midnight">Speaker bio</span>
                        <textarea
                          value={speakerBio}
                          onChange={(event) => setSpeakerBio(event.target.value)}
                          rows={5}
                          className="rounded-[10px] border border-midnight/10 px-4 py-3 text-sm leading-6 text-midnight outline-none focus:border-midnight/24"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => void saveSpeaker()}
                        className="rounded-[10px] bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0e5a70]"
                      >
                        Save speaker card
                      </button>
                    </>
                  ) : null}
                </div>
              ) : (
                <p className="mt-4 text-sm text-midnight/68">
                  No speakers are linked to this session yet.
                </p>
              )}
              {message ? <p className="mt-4 text-sm text-midnight/68">{message}</p> : null}
            </article>
          </div>
        ) : null}
      </div>
    </section>
  );
}
