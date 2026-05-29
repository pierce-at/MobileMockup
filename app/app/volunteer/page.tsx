"use client";

import { useMemo } from "react";

import { useAppState } from "@/lib/state/app-state";

export default function VolunteerPage() {
  const { currentUser, venues, volunteerAssignments } = useAppState();
  const myAssignments = useMemo(
    () =>
      volunteerAssignments.filter(
        (assignment) =>
          assignment.profileId === currentUser.id ||
          assignment.email.toLowerCase() === currentUser.email?.toLowerCase()
      ),
    [currentUser.email, currentUser.id, volunteerAssignments]
  );

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] bg-[linear-gradient(135deg,#0a1838,#142554)] p-6 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Volunteer</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Volunteer desk</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
          Shift assignments, venue context, and where coverage still needs help.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">My assignments</p>
          <div className="mt-4 grid gap-3">
            {myAssignments.length ? (
              myAssignments.map((assignment) => {
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
                      {assignment.day.toUpperCase()} · {assignment.startTime} - {assignment.endTime}
                    </p>
                    {venue ? (
                      <p className="mt-2 text-sm leading-6 text-midnight/70">
                        {venue.name} · {venue.address}
                      </p>
                    ) : null}
                    {assignment.notes ? (
                      <p className="mt-2 text-sm leading-6 text-midnight/70">{assignment.notes}</p>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-[22px] border border-dashed border-midnight/10 bg-mist p-4 text-sm text-midnight/68">
                No shift is tied to this profile yet. Operations can still assign you manually.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.24em] text-coral">Coverage board</p>
          <div className="mt-4 grid gap-3">
            {volunteerAssignments.map((assignment) => {
              const venue = venues.find((item) => item.id === assignment.venueId);
              return (
                <div key={assignment.id} className="rounded-[22px] border border-midnight/8 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-xl font-semibold text-midnight">
                      {assignment.assignedRole ?? assignment.requestedRole}
                    </p>
                    <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-semibold text-midnight/60">
                      {assignment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-midnight/68">
                    {assignment.name} · {assignment.day.toUpperCase()} · {assignment.startTime} -{" "}
                    {assignment.endTime}
                  </p>
                  {venue ? (
                    <p className="mt-2 text-sm leading-6 text-midnight/70">{venue.name}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
