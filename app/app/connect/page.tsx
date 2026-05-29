"use client";

import { useMemo, useState } from "react";

import { useAppState } from "@/lib/state/app-state";

export default function ConnectPage() {
  const { getDiscoverableProfiles, isReady } = useAppState();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");

  const discoverableProfiles = getDiscoverableProfiles();
  const roles = ["All", ...new Set(discoverableProfiles.map((profile) => profile.role))];
  const companies = ["All", ...new Set(discoverableProfiles.map((profile) => profile.company))];

  const profiles = useMemo(
    () =>
      discoverableProfiles.filter((profile) => {
        const matchesQuery =
          !query ||
          [profile.name, profile.role, profile.company, profile.bio]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
        const matchesRole = roleFilter === "All" || profile.role === roleFilter;
        const matchesCompany = companyFilter === "All" || profile.company === companyFilter;

        return matchesQuery && matchesRole && matchesCompany;
      }),
    [companyFilter, discoverableProfiles, query, roleFilter]
  );

  return (
    <section className="space-y-4">
      <div className="ms-summary">
        <div className="lbl">Connect</div>
        <h1 className="big">Opt-in people layer.</h1>
        <div className="ms-stats">
          <div className="ms-stat">
            <div className="n">{discoverableProfiles.length}</div>
            <div className="l">Visible</div>
          </div>
          <div className="ms-stat">
            <div className="n">{roles.length - 1}</div>
            <div className="l">Roles</div>
          </div>
          <div className="ms-stat">
            <div className="n">{companies.length - 1}</div>
            <div className="l">Companies</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-midnight/8 bg-white p-4 shadow-card">
        <div className="grid gap-2 sm:grid-cols-[1.1fr,0.8fr,0.9fr]">
          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[12px] text-midnight/48">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search founders, investors, operators"
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none placeholder:text-midnight/40"
            />
          </label>

          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
              Role
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 items-center gap-2 rounded-[16px] border border-midnight/8 bg-mist px-3 py-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-midnight/48">
              Company
            </span>
            <select
              value={companyFilter}
              onChange={(event) => setCompanyFilter(event.target.value)}
              className="w-full min-w-0 bg-transparent text-[13px] text-midnight outline-none"
            >
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!isReady ? (
        <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-midnight/8 bg-white/70 p-6 text-center shadow-card">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
              Loading
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-midnight">
              Pulling the attendee layer.
            </p>
          </div>
        </div>
      ) : profiles.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-[28px] border border-midnight/8 bg-white p-5 shadow-card"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-midnight font-semibold text-white">
                  {profile.avatar}
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-2xl font-semibold text-midnight">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-midnight/64">
                    {profile.role} · {profile.company}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-midnight/72">{profile.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2" data-testid="discoverable-profile-card">
                {profile.visibleContactFields.map((field) => (
                  <span
                    key={field}
                    className="rounded-full bg-mist px-3 py-2 text-sm text-midnight/72"
                  >
                    {profile.contactLinks[field]}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-[220px] place-items-center rounded-[28px] border border-dashed border-midnight/10 bg-white/70 p-6 text-center shadow-card">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-coral">
              No matches
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-midnight">
              Nobody matches those filters.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
