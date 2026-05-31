"use client";

import Link from "next/link";

import { useAppState } from "@/lib/state/app-state";

type HubLink = {
  href: string;
  label: string;
  note: string;
  pill?: string;
};

type TreeNode = {
  label: string;
  href?: string;
  note?: string;
  children?: TreeNode[];
};

function HubSection({
  title,
  eyebrow,
  links
}: {
  title: string;
  eyebrow: string;
  links: HubLink[];
}) {
  return (
    <section className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
      <p className="text-[10px] uppercase tracking-[0.24em] text-coral">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-midnight">{title}</h2>
      <div className="mt-4 grid gap-3">
        {links.map((link) => (
          <Link
            key={`${title}-${link.href}`}
            href={link.href}
            className="rounded-[12px] border border-midnight/8 bg-[linear-gradient(180deg,#fffdf9,#f7f3ea)] px-4 py-4 transition hover:border-midnight/16 hover:bg-mist"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[20px] font-semibold leading-tight text-midnight">
                  {link.label}
                </p>
                <p className="mt-1 text-sm leading-6 text-midnight/64">{link.note}</p>
                <p className="mt-2 text-[11px] font-semibold text-midnight/52">{link.href}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {link.pill ? (
                  <span className="rounded-full bg-[rgba(251,189,25,0.18)] px-3 py-1 text-[11px] font-semibold text-[#8f6a02]">
                    {link.pill}
                  </span>
                ) : null}
                <span className="rounded-full bg-midnight px-3 py-1.5 text-[11px] font-semibold text-white">
                  Open
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HubTree({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="space-y-3">
      {nodes.map((node) => (
        <li key={`${node.label}-${node.href ?? "group"}`} className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-gold" />
            <div className="min-w-0">
              {node.href ? (
                <Link
                  href={node.href}
                  className="font-display text-[20px] font-semibold leading-tight text-midnight underline-offset-4 hover:underline"
                >
                  {node.label}
                </Link>
              ) : (
                <p className="font-display text-[20px] font-semibold leading-tight text-midnight">
                  {node.label}
                </p>
              )}
              {node.note ? (
                <p className="mt-1 text-sm leading-6 text-midnight/64">{node.note}</p>
              ) : null}
              {node.href ? (
                <p className="mt-1 text-[11px] font-semibold text-midnight/48">{node.href}</p>
              ) : null}
              {node.children?.length ? (
                <div className="mt-3 border-l border-midnight/12 pl-4">
                  <HubTree nodes={node.children} />
                </div>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function HubPage() {
  const { currentUser, sponsors, sessions } = useAppState();
  const sponsor = sponsors[0];
  const session = sessions[0];

  const publicLinks: HubLink[] = [
    {
      href: "/",
      label: "Landing page",
      note: "Main branded entry and starting point for the attendee app.",
      pill: "Public"
    },
    {
      href: "/app/hub",
      label: "App map",
      note: "This route directory. Use it any time you want to jump around the product.",
      pill: "Tracker"
    }
  ];

  const attendeeLinks: HubLink[] = [
    {
      href: "/app/schedule",
      label: "Schedule",
      note: "Browse sessions, search, filter, and save events."
    },
    {
      href: "/app/my-schedule",
      label: "My Week",
      note: "See saved sessions, conflicts, updates, and suggested sessions."
    },
    {
      href: "/app/map",
      label: "Map",
      note: "See saved stops first, then drill into venues and venue calendars."
    },
    {
      href: "/app/community",
      label: "Community",
      note: "Sponsor directory and sponsor detail pages."
    },
    {
      href: "/app/connect",
      label: "Connect",
      note: "Opt-in attendee directory with profile discovery controls."
    },
    {
      href: "/app/profile",
      label: "Profile",
      note: "Auth state, privacy controls, contact sharing, and role jumps."
    },
    {
      href: "/app/onboarding",
      label: "Onboarding",
      note: "Dedicated setup page for role switching, first-run tasks, and demo prep."
    },
    {
      href: "/app/updates",
      label: "Updates",
      note: "Schedule changes, release notes, and attendee-facing notifications."
    },
    {
      href: "/app/ticket",
      label: "Ticket / Eventbrite",
      note: "External ticket handoff and mobile ticketing surface."
    },
    {
      href: "/app/volunteer",
      label: "Volunteer desk",
      note: "Shift coverage, assignments, and on-site support view."
    },
    {
      href: "/app/submit",
      label: "Submit a session",
      note: "Public event/session intake form."
    }
  ];

  if (session) {
    attendeeLinks.push({
      href: `/app/sessions/${session.slug}`,
      label: "Session detail example",
      note: `Example detail route for "${session.title}".`,
      pill: "Dynamic"
    });
  }

  if (sponsor) {
    attendeeLinks.push({
      href: `/app/community/${sponsor.slug}`,
      label: "Sponsor page example",
      note: `Example public sponsor page for ${sponsor.name}.`,
      pill: "Dynamic"
    });
  }

  const sponsorLinks: HubLink[] = [
    {
      href: "/app/sponsor",
      label: "Sponsor overview",
      note: "Main sponsor hub landing page."
    },
    {
      href: "/app/sponsor/reach",
      label: "Page Views & Reach",
      note: "Analytics, trends, placements, and audience breakdown."
    },
    {
      href: "/app/sponsor/sessions",
      label: "Sponsored Sessions",
      note: "View sponsored session reach, counts, and performance."
    },
    {
      href: "/app/sponsor/booth",
      label: "Booth & Activations",
      note: "Track venue activations, map taps, and footprint."
    },
    {
      href: "/app/sponsor/edit",
      label: "Edit Sponsor Page",
      note: "Manage headline, links, sessions, and public-facing sponsor content."
    },
    {
      href: "/app/sponsor/leads",
      label: "Lead Capture",
      note: "Opt-in lead view and source breakdown."
    },
    {
      href: "/app/sponsor/team",
      label: "Team",
      note: "Sponsor-side team roster and access surface."
    },
    {
      href: "/app/sponsor/fulfillment",
      label: "Fulfillment Recap",
      note: "Deliverables and sponsor fulfillment summary."
    }
  ];

  const opsLinks: HubLink[] = [
    {
      href: "/app/workspace",
      label: "Speaker desk",
      note: "Speaker and host editing for owned sessions, materials, and logistics."
    },
    {
      href: "/app/admin",
      label: "Admin console",
      note: "Submission review, schedule publishing, and control surface."
    }
  ];

  const treeNodes: TreeNode[] = [
    {
      label: "Public",
      children: [
        { label: "Landing page", href: "/" },
        { label: "App map", href: "/app/hub" }
      ]
    },
    {
      label: "Attendee app",
      children: [
        { label: "Onboarding", href: "/app/onboarding" },
        { label: "Schedule", href: "/app/schedule" },
        { label: "My Week", href: "/app/my-schedule" },
        { label: "Map", href: "/app/map" },
        {
          label: "Community",
          href: "/app/community",
          children: sponsor
            ? [{ label: `${sponsor.name} sponsor page`, href: `/app/community/${sponsor.slug}` }]
            : []
        },
        { label: "Connect", href: "/app/connect" },
        { label: "Profile", href: "/app/profile" },
        { label: "Updates", href: "/app/updates" },
        { label: "Ticket / Eventbrite", href: "/app/ticket" },
        { label: "Volunteer desk", href: "/app/volunteer" },
        { label: "Submit a session", href: "/app/submit" },
        ...(session
          ? [{ label: "Session detail example", href: `/app/sessions/${session.slug}` }]
          : [])
      ]
    },
    {
      label: "Sponsor hub",
      children: sponsorLinks.map((link) => ({
        label: link.label,
        href: link.href
      }))
    },
    {
      label: "Operations",
      children: opsLinks.map((link) => ({
        label: link.label,
        href: link.href
      }))
    }
  ];

  return (
    <section className="space-y-4">
      <div className="rounded-[18px] bg-[linear-gradient(135deg,#0c495a,#0e5a70)] p-6 text-white shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Route directory</p>
            <h1 className="mt-3 font-display text-4xl font-semibold">App map</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/74">
              Click through the whole product from one place. Good for QA, planning, demos, and
              just keeping your bearings while the app grows.
            </p>
          </div>
          <div className="rounded-[12px] border border-white/10 bg-white/6 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.24em] text-white/55">Current role</p>
            <p className="mt-2 font-display text-xl font-semibold text-gold">
              {currentUser.appRole}
            </p>
            <p className="mt-1 text-sm text-white/68">{currentUser.name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.82fr,1.18fr]">
        <HubSection title="Start Here" eyebrow="Public" links={publicLinks} />
        <HubSection title="Attendee App" eyebrow="Core" links={attendeeLinks} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HubSection title="Sponsor Hub" eyebrow="Role" links={sponsorLinks} />
        <HubSection title="Operations" eyebrow="Team" links={opsLinks} />
      </div>

      <section className="rounded-[14px] border border-midnight/8 bg-white p-5 shadow-card">
        <p className="text-[10px] uppercase tracking-[0.24em] text-coral">Tree</p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-midnight">Route tree</h2>
        <p className="mt-2 text-sm leading-6 text-midnight/64">
          Same hub, but as a nested tree so user can see structure without memorizing URLs.
        </p>
        <div className="mt-5 rounded-[12px] bg-[linear-gradient(180deg,#fffdf9,#f7f3ea)] p-4">
          <HubTree nodes={treeNodes} />
        </div>
      </section>
    </section>
  );
}
