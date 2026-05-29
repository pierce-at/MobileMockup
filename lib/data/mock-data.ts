import type { AppState } from "@/lib/domain/types";

export const defaultAppState: AppState = {
  currentUser: {
    id: "attendee-maya",
    name: "Maya Brooks",
    role: "Founder",
    appRole: "attendee",
    company: "Aurora Freight",
    bio: "Building calmer freight ops for distributed teams across the Midwest startup ecosystem.",
    avatar: "MB",
    interests: ["Logistics", "Operations", "AI", "Community"],
    isDiscoverable: true,
    visibleContactFields: ["email", "linkedin"],
    email: "maya@aurorafreight.co",
    contactLinks: {
      email: "maya@aurorafreight.co",
      linkedin: "linkedin.com/in/maya-brooks",
      website: "aurorafreight.co"
    }
  },
  savedSchedule: [],
  venues: [
    {
      id: "umn",
      name: "UMN Carlson",
      address: "321 19th Ave S, Minneapolis, MN",
      lat: 44.9727,
      lng: -93.2436,
      campus: "University of Minnesota",
      transitNotes: "Light rail + East Bank shuttle every 10 minutes.",
      parkingNotes: "Washington Ave ramp recommended before 10 AM.",
      accessibilityNotes: "Elevator access at south entrance, accessible seating held in first two rows.",
      mapLink: "https://maps.apple.com/?q=UMN+Carlson"
    },
    {
      id: "surly",
      name: "Surly Brewing Co.",
      address: "520 Malcolm Ave SE, Minneapolis, MN",
      lat: 44.9742,
      lng: -93.2092,
      transitNotes: "Five-minute rideshare from UMN East Bank.",
      parkingNotes: "Overflow parking on Malcolm Ave after 4 PM."
    },
    {
      id: "stthomas",
      name: "University of St. Thomas",
      address: "2115 Summit Ave, St Paul, MN",
      lat: 44.9402,
      lng: -93.1896,
      campus: "University of St. Thomas",
      transitNotes: "Summit shuttle loop departs every 20 minutes.",
      parkingNotes: "Reserved guest parking at Anderson deck.",
      accessibilityNotes: "Accessible entry on the east side with indoor route to Anderson Hall.",
      mapLink: "https://maps.apple.com/?q=University+of+St+Thomas"
    },
    {
      id: "mcnamara",
      name: "McNamara Alumni Center",
      address: "200 Oak St SE, Minneapolis, MN",
      lat: 44.9739,
      lng: -93.2277,
      campus: "University of Minnesota",
      transitNotes: "Easy East Bank light rail walk with direct event signage.",
      parkingNotes: "Underground parking available off Oak Street.",
      accessibilityNotes: "Automatic doors and ramp access at the main Oak Street entrance.",
      mapLink: "https://maps.apple.com/?q=McNamara+Alumni+Center"
    },
    {
      id: "machine-shop",
      name: "The Machine Shop",
      address: "300 2nd St SE, Minneapolis, MN",
      lat: 44.9875,
      lng: -93.2575,
      transitNotes: "Five-minute walk from the riverfront shuttle loop.",
      parkingNotes: "Surface lots fill early after 5 PM."
    },
    {
      id: "union-depot",
      name: "Union Depot",
      address: "214 4th St E, St Paul, MN",
      lat: 44.9488,
      lng: -93.0849,
      transitNotes: "Direct Green Line access and rideshare queue at 4th Street.",
      parkingNotes: "Red ramp is the easiest entry for evening sessions."
    },
    {
      id: "arbeiter",
      name: "Arbeiter Brewing",
      address: "3038 Minnehaha Ave, Minneapolis, MN",
      lat: 44.9478,
      lng: -93.2315,
      transitNotes: "Blue Line stop is a short walk south on Minnehaha.",
      parkingNotes: "Neighborhood parking only after 6 PM."
    }
  ],
  sponsors: [
    {
      id: "sponsor-usbank",
      slug: "us-bank",
      name: "U.S. Bank",
      tier: "Presenting Sponsor",
      track: "FinTech",
      description:
        "Backing founders with banking tools, venture relationships, and community programming tailored to early-stage operators.",
      logo: "US",
      contactLinks: {
        website: "usbank.com/business-banking",
        linkedin: "linkedin.com/company/us-bank"
      },
      featuredSessionIds: ["session-fintech"]
    },
    {
      id: "sponsor-matchstick",
      slug: "matchstick-ventures",
      name: "Matchstick Ventures",
      tier: "Stage Sponsor",
      track: "Founders",
      description:
        "Early-stage venture fund supporting founders from day zero with local network depth and operator-led guidance.",
      logo: "MV",
      contactLinks: {
        website: "matchstickventures.com",
        linkedin: "linkedin.com/company/matchstick-ventures"
      },
      featuredSessionIds: ["session-investor", "session-community"]
    },
    {
      id: "sponsor-deed",
      slug: "mn-deed",
      name: "MN DEED",
      tier: "Community Partner",
      track: "Ecosystem",
      description:
        "Statewide innovation programs, grants, and ecosystem support for founders, students, and community builders.",
      logo: "DE",
      contactLinks: {
        website: "mn.gov/deed",
        linkedin: "linkedin.com/company/minnesota-department-of-employment-and-economic-development"
      },
      featuredSessionIds: ["session-community"]
    }
  ],
  submissions: [
    {
      id: "submission-lakeframe",
      title: "Ops Playbooks for Post-Seed Teams",
      submitterName: "Nia Carter",
      submitterEmail: "nia@lakeframe.com",
      submitterProfileId: undefined,
      company: "Lakeframe",
      track: "Operations",
      format: "Workshop",
      summary:
        "A practical teardown of operator rituals, dashboards, and runbooks that keep lean startup teams from burning out during growth spurts.",
      fullDescription:
        "An operator-led workshop on post-seed operating cadence, dashboard hygiene, decision rituals, and how teams can build processes that survive real growth instead of collapsing under it.",
      intendedAudience: "Founders, operators, chiefs of staff, and early team leads.",
      themes: ["Operations", "Systems", "Growth"],
      speakerDetails:
        "Nia Carter, COO at Lakeframe. Looking for one operator co-speaker from a B2B SaaS team.",
      logisticsNeeds: "Projector, whiteboard wall, and movable seating for small-group work.",
      submissionResources: [
        { label: "Lakeframe workshop outline", url: "https://lakeframe.example.com/ops-playbook" }
      ],
      requestedDay: "fri",
      status: "in_review",
      internalNotes: "Strong fit. Need final AV requirements and room size estimate.",
      decisionNote: "",
      assignedReviewer: "Avery Cole",
      lastReviewedAt: "2026-05-23T10:10:00.000Z",
      linkedSessionId: undefined,
      createdAt: "2026-05-22T14:10:00.000Z"
    },
    {
      id: "submission-bread-butter",
      title: "What Midwest Investors Want in 2026",
      submitterName: "Eden Cho",
      submitterEmail: "eden@breadandbutterventures.com",
      submitterProfileId: "attendee-eden",
      company: "Bread & Butter Ventures",
      track: "Capital",
      format: "Panel",
      summary:
        "A candid look at what investors actually want to see in seed-stage founder updates, fundraising narratives, and technical diligence.",
      fullDescription:
        "A panel for founders who want a clearer read on what investor communications actually build trust in 2026, with practical examples of updates, diligence materials, and traction framing.",
      intendedAudience: "Seed-stage founders and finance leads.",
      themes: ["Capital", "AI", "Growth"],
      speakerDetails:
        "Eden Cho will moderate and bring one founder plus one operator-investor into the conversation.",
      logisticsNeeds: "Three chairs, handheld microphones, and overflow-friendly seating.",
      submissionResources: [
        { label: "Panel outline", url: "https://breadandbutter.example.com/midwest-investors" }
      ],
      requestedDay: "wed",
      status: "approved",
      internalNotes: "Approved for Wednesday capital block. Pair with operator counterpoint.",
      decisionNote: "Approved for the Wednesday capital block pending final lineup confirmation.",
      assignedReviewer: "Avery Cole",
      lastReviewedAt: "2026-05-21T08:15:00.000Z",
      linkedSessionId: "session-investor",
      createdAt: "2026-05-20T09:40:00.000Z"
    },
    {
      id: "submission-northloop",
      title: "Warehouse Robotics Without the Hype",
      submitterName: "Dylan Hart",
      submitterEmail: "dylan@northlooprobotics.com",
      submitterProfileId: "attendee-dylan",
      company: "North Loop Robotics",
      track: "Hardware",
      format: "Talk",
      summary:
        "An honest breakdown of what breaks first in warehouse robotics deployments and how teams can design around brittle automation assumptions.",
      fullDescription:
        "A talk for operators and technical founders on where robotics pilots fail in warehouses, what assumptions create brittle deployments, and how teams can scope better automation bets.",
      intendedAudience: "Hardware founders, operators, logistics leads, and technical builders.",
      themes: ["Operations", "Demo", "Systems"],
      speakerDetails: "Dylan Hart, Founder at North Loop Robotics.",
      logisticsNeeds: "Confidence monitor if available. Would love room for one table-top hardware demo.",
      submissionResources: [
        { label: "Talk abstract", url: "https://northloop.example.com/warehouse-robotics" }
      ],
      requestedDay: "thu",
      status: "submitted",
      internalNotes: "",
      decisionNote: "",
      assignedReviewer: undefined,
      lastReviewedAt: undefined,
      linkedSessionId: undefined,
      createdAt: "2026-05-27T16:05:00.000Z"
    }
  ],
  scheduleControl: {
    id: "tcsw-2026",
    isPublished: true,
    lockedAt: "2026-05-26T18:30:00.000Z",
    publishedAt: "2026-05-27T13:00:00.000Z",
    announcement: "Schedule is live. Only approved session edits should move after publish.",
    releaseVersion: 3,
    hasUnpublishedChanges: true,
    lastPublishedBy: "Avery Cole",
    lastEditedAt: "2026-05-29T08:45:00.000Z"
  },
  profiles: [
    {
      id: "attendee-maya",
      name: "Maya Brooks",
      role: "Founder",
      appRole: "attendee",
      company: "Aurora Freight",
      bio: "Building calmer freight ops for distributed teams across the Midwest startup ecosystem.",
      avatar: "MB",
      interests: ["Logistics", "Operations", "AI", "Community"],
      isDiscoverable: true,
      visibleContactFields: ["email", "linkedin"],
      email: "maya@aurorafreight.co",
      contactLinks: {
        email: "maya@aurorafreight.co",
        linkedin: "linkedin.com/in/maya-brooks",
        website: "aurorafreight.co"
      }
    },
    {
      id: "attendee-eden",
      name: "Eden Cho",
      role: "GP",
      appRole: "attendee",
      company: "Bread & Butter Ventures",
      bio: "Investing in practical AI and connective tissue across the Twin Cities operator community.",
      avatar: "EC",
      interests: ["Capital", "AI", "Community", "Growth"],
      isDiscoverable: true,
      visibleContactFields: ["linkedin"],
      email: "eden@breadandbutterventures.com",
      contactLinks: {
        linkedin: "linkedin.com/in/eden-cho"
      }
    },
    {
      id: "attendee-rina",
      name: "Rina Patel",
      role: "CTO",
      appRole: "sponsor",
      company: "Honeycrisp AI",
      bio: "Operating at the intersection of applied ML, supply chain, and climate-aware infrastructure.",
      avatar: "RP",
      interests: ["AI", "Climate", "Logistics", "Product"],
      isDiscoverable: true,
      visibleContactFields: ["email", "website"],
      email: "rina@honeycrisp.ai",
      sponsorId: "sponsor-matchstick",
      contactLinks: {
        email: "rina@honeycrisp.ai",
        website: "honeycrisp.ai"
      }
    },
    {
      id: "attendee-dylan",
      name: "Dylan Hart",
      role: "Founder",
      appRole: "host",
      company: "North Loop Robotics",
      bio: "Making warehouse robotics less brittle and more human-readable.",
      avatar: "DH",
      interests: ["Operations", "Product", "Demo"],
      isDiscoverable: false,
      visibleContactFields: ["linkedin"],
      email: "dylan@northlooprobotics.com",
      contactLinks: {
        linkedin: "linkedin.com/in/dylan-hart"
      }
    },
    {
      id: "attendee-avery",
      name: "Avery Cole",
      role: "Program Director",
      appRole: "admin",
      company: "BETA",
      bio: "Keeps review, scheduling, sponsors, and event operations moving without losing the human thread.",
      avatar: "AC",
      interests: ["Operations", "Community", "Systems"],
      isDiscoverable: false,
      visibleContactFields: ["email"],
      email: "avery@beta.mn",
      contactLinks: {
        email: "avery@beta.mn"
      }
    }
  ],
  sessions: [
    {
      id: "session-fintech",
      slug: "banking-the-next-10m",
      title: "Banking the Next 10M",
      description:
        "Founders and operators unpack how fintech infrastructure actually scales in the Midwest without losing trust or compliance discipline.",
      format: "Panel",
      audience: "Founders, fintech operators, finance leads",
      day: "wed",
      startTime: "10:00 AM",
      endTime: "10:45 AM",
      venueId: "umn",
      room: "Track A · Carlson 1-220",
      speakers: [
        {
          id: "speaker-priya",
          name: "Priya Shah",
          role: "Founder",
          company: "Northstar Pay",
          bio: "Payments founder focused on regional SMB cashflow tools.",
          avatar: "PS",
          updatedAt: "2026-05-27T15:05:00.000Z"
        },
        {
          id: "speaker-marcus",
          name: "Marcus Lee",
          role: "VP Innovation",
          company: "U.S. Bank",
          bio: "Leads startup partnerships and commercial innovation pilots.",
          avatar: "ML",
          updatedAt: "2026-05-27T15:05:00.000Z"
        }
      ],
      sponsorId: "sponsor-usbank",
      tags: ["FinTech", "Scaling", "Sponsored"],
      isFeatured: true,
      isSponsored: true,
      capacity: 240,
      attendeeCount: 188,
      ownerProfileId: "attendee-maya",
      logisticsNotes: "Needs lapel mic backup and quick sponsor lower-third review.",
      hostNotes: "Confirm founder intro copy and stage timer.",
      externalRegistrationUrl: "https://www.eventbrite.com/e/tcsw-fintech-track",
      publishedAt: "2026-05-27T13:00:00.000Z",
      lastScheduleChangeAt: "2026-05-28T17:15:00.000Z",
      updatedAt: "2026-05-28T17:15:00.000Z"
    },
    {
      id: "session-investor",
      slug: "investor-roundtable-midwest-ai",
      title: "Investor Roundtable: Midwest AI",
      description:
        "Operators and investors share what they fund, what they fear, and what founders should stop putting in seed decks.",
      format: "Roundtable",
      audience: "Seed founders, investors, technical operators",
      day: "wed",
      startTime: "10:30 AM",
      endTime: "11:15 AM",
      venueId: "umn",
      room: "Track B · Carlson 1-130",
      speakers: [
        {
          id: "speaker-eden",
          name: "Eden Cho",
          role: "GP",
          company: "Bread & Butter Ventures",
          bio: "Backs applied AI and infrastructure founders.",
          avatar: "EC",
          email: "eden@breadandbutterventures.com",
          profileId: "attendee-eden",
          updatedAt: "2026-05-27T11:30:00.000Z"
        },
        {
          id: "speaker-rina",
          name: "Rina Patel",
          role: "CTO",
          company: "Honeycrisp AI",
          bio: "Builds production AI systems for operations teams.",
          avatar: "RP",
          email: "rina@honeycrisp.ai",
          profileId: "attendee-rina",
          updatedAt: "2026-05-28T09:25:00.000Z"
        }
      ],
      sponsorId: "sponsor-matchstick",
      tags: ["AI", "Capital", "Featured"],
      isFeatured: true,
      isSponsored: true,
      capacity: 180,
      attendeeCount: 162,
      ownerProfileId: "attendee-rina",
      sourceSubmissionId: "submission-bread-butter",
      logisticsNotes: "Needs two handheld mics and confidence monitor.",
      hostNotes: "Confirm investor intros block and reserve overflow seating.",
      externalRegistrationUrl: "https://www.eventbrite.com/e/tcsw-investor-roundtable",
      publishedAt: "2026-05-27T13:00:00.000Z",
      lastScheduleChangeAt: "2026-05-28T18:40:00.000Z",
      updatedAt: "2026-05-28T18:40:00.000Z"
    },
    {
      id: "session-happy-hour",
      slug: "surly-happy-hour",
      title: "TCSW Happy Hour at Surly",
      description:
        "Founders, operators, and sponsors unwind across one giant patio with one clear pin and no venue confusion.",
      day: "tue",
      startTime: "4:00 PM",
      endTime: "6:00 PM",
      venueId: "surly",
      room: "Beer Hall + Patio",
      speakers: [],
      tags: ["Social", "Networking"],
      isFeatured: true,
      isSponsored: false,
      attendeeCount: 312,
      updatedAt: "2026-05-27T10:00:00.000Z"
    },
    {
      id: "session-community",
      slug: "building-founder-density",
      title: "Building Founder Density Across Minnesota",
      description:
        "Community builders compare what actually works when you want more founders to stay, ship, and hire here.",
      day: "thu",
      startTime: "1:00 PM",
      endTime: "1:45 PM",
      venueId: "stthomas",
      room: "Anderson Hall",
      speakers: [
        {
          id: "speaker-jules",
          name: "Jules Romero",
          role: "Program Director",
          company: "MN DEED",
          bio: "Shapes founder support programs across statewide innovation networks.",
          avatar: "JR",
          updatedAt: "2026-05-26T13:20:00.000Z"
        }
      ],
      sponsorId: "sponsor-deed",
      tags: ["Community", "Policy"],
      isFeatured: false,
      isSponsored: true,
      attendeeCount: 121,
      updatedAt: "2026-05-26T13:20:00.000Z"
    },
    {
      id: "session-ops",
      slug: "founder-ops-without-chaos",
      title: "Founder Ops Without Chaos",
      description:
        "A compact teardown of the systems, dashboards, and habits that keep five-day event weeks from becoming five-alarm fires.",
      format: "Workshop",
      audience: "Founders, operators, chiefs of staff",
      day: "fri",
      startTime: "9:30 AM",
      endTime: "10:15 AM",
      venueId: "umn",
      room: "Track C · Carlson 2-110",
      speakers: [
        {
          id: "speaker-nia",
          name: "Nia Carter",
          role: "COO",
          company: "Lakeframe",
          bio: "Turns messy operator workflows into repeatable systems.",
          avatar: "NC",
          email: "nia@lakeframe.com",
          updatedAt: "2026-05-27T08:10:00.000Z"
        }
      ],
      tags: ["Operations", "Systems"],
      isFeatured: false,
      isSponsored: false,
      attendeeCount: 94,
      ownerProfileId: "attendee-dylan",
      logisticsNotes: "Workshop table layout and hallway signage requested.",
      hostNotes: "Coordinate with ops volunteer lead on room reset.",
      externalRegistrationUrl: "https://www.eventbrite.com/e/tcsw-founder-ops",
      publishedAt: "2026-05-27T13:00:00.000Z",
      lastScheduleChangeAt: "2026-05-27T08:10:00.000Z",
      updatedAt: "2026-05-27T08:10:00.000Z"
    },
    {
      id: "session-product-led",
      slug: "product-led-growth-midwest-b2b",
      title: "Product-Led Growth for Midwest B2B",
      description:
        "Operators share the onboarding loops, pricing triggers, and instrumentation choices that actually moved expansion revenue in lean teams.",
      day: "mon",
      startTime: "9:00 AM",
      endTime: "9:45 AM",
      venueId: "mcnamara",
      room: "Johnson Great Room",
      speakers: [],
      tags: ["Growth", "Product"],
      isFeatured: true,
      isSponsored: false,
      attendeeCount: 134,
      updatedAt: "2026-05-27T09:20:00.000Z"
    },
    {
      id: "session-climate-logistics",
      slug: "climate-logistics-hard-things",
      title: "Climate Logistics: The Hard Things",
      description:
        "Founders from freight, manufacturing, and energy trade notes on where climate ambition survives first contact with procurement and margins.",
      day: "mon",
      startTime: "10:15 AM",
      endTime: "11:00 AM",
      venueId: "mcnamara",
      room: "River Terrace",
      speakers: [],
      sponsorId: "sponsor-deed",
      tags: ["Climate", "Logistics", "Community"],
      isFeatured: false,
      isSponsored: true,
      attendeeCount: 102,
      updatedAt: "2026-05-26T16:40:00.000Z"
    },
    {
      id: "session-founder-breakfast",
      slug: "founder-breakfast-riverfront",
      title: "Founder Breakfast on the Riverfront",
      description:
        "A loose low-pressure breakfast block for first-time attendees, repeat founders, and operators who want one easy start before the day accelerates.",
      day: "tue",
      startTime: "8:00 AM",
      endTime: "9:00 AM",
      venueId: "machine-shop",
      room: "Cafe Floor",
      speakers: [],
      tags: ["Community", "Networking", "Social"],
      isFeatured: false,
      isSponsored: false,
      attendeeCount: 156,
      updatedAt: "2026-05-27T07:50:00.000Z"
    },
    {
      id: "session-revenue-systems",
      slug: "revenue-systems-first-25-customers",
      title: "Revenue Systems for the First 25 Customers",
      description:
        "A working session on founder-led sales handoff, pipeline hygiene, and the dashboards that stop early go-to-market teams from lying to themselves.",
      day: "tue",
      startTime: "11:00 AM",
      endTime: "11:45 AM",
      venueId: "umn",
      room: "Track D · Carlson 1-140",
      speakers: [],
      tags: ["Revenue", "Systems", "Operations"],
      isFeatured: false,
      isSponsored: false,
      attendeeCount: 118,
      updatedAt: "2026-05-28T08:05:00.000Z"
    },
    {
      id: "session-health-ai",
      slug: "health-ai-and-compliance-reality",
      title: "Health AI and Compliance Reality",
      description:
        "Healthcare founders and operators cut through vapor and explain where responsible AI design still gets strangled by workflow and policy debt.",
      day: "wed",
      startTime: "1:15 PM",
      endTime: "2:00 PM",
      venueId: "mcnamara",
      room: "Memorial Hall",
      speakers: [],
      sponsorId: "sponsor-usbank",
      tags: ["AI", "Health", "Sponsored"],
      isFeatured: true,
      isSponsored: true,
      attendeeCount: 176,
      updatedAt: "2026-05-28T13:10:00.000Z"
    },
    {
      id: "session-demo-night",
      slug: "demo-night-machine-shop",
      title: "Demo Night at The Machine Shop",
      description:
        "Founders show product in public, sponsors mingle without awkwardness, and the whole room gets a tighter sense of who is actually shipping.",
      day: "wed",
      startTime: "6:00 PM",
      endTime: "8:00 PM",
      venueId: "machine-shop",
      room: "Main Floor",
      speakers: [],
      tags: ["Demo", "Community", "Social"],
      isFeatured: true,
      isSponsored: false,
      attendeeCount: 268,
      updatedAt: "2026-05-27T19:10:00.000Z"
    },
    {
      id: "session-public-sector",
      slug: "public-sector-procurement-for-startups",
      title: "Public Sector Procurement for Startups",
      description:
        "Operators who have actually sold into state and city systems explain the paperwork traps, timing realities, and relationship patterns founders need to know.",
      day: "thu",
      startTime: "9:15 AM",
      endTime: "10:00 AM",
      venueId: "union-depot",
      room: "Head House",
      speakers: [],
      sponsorId: "sponsor-deed",
      tags: ["Policy", "Community", "Capital"],
      isFeatured: false,
      isSponsored: true,
      attendeeCount: 109,
      updatedAt: "2026-05-27T14:45:00.000Z"
    },
    {
      id: "session-founder-finance",
      slug: "founder-finance-after-seed",
      title: "Founder Finance After Seed",
      description:
        "A practical teardown of cash planning, burn discipline, and board communication once the celebratory fundraise post has worn off.",
      day: "thu",
      startTime: "11:30 AM",
      endTime: "12:15 PM",
      venueId: "stthomas",
      room: "Schulze Hall",
      speakers: [],
      sponsorId: "sponsor-usbank",
      tags: ["FinTech", "Capital", "Sponsored"],
      isFeatured: false,
      isSponsored: true,
      attendeeCount: 143,
      updatedAt: "2026-05-28T10:35:00.000Z"
    },
    {
      id: "session-community-dinner",
      slug: "community-dinner-long-table",
      title: "Community Dinner: Long Table Edition",
      description:
        "One deliberately social evening block built for loose founder matching, sponsor warmth, and fewer awkward hallway half-conversations.",
      day: "thu",
      startTime: "6:30 PM",
      endTime: "8:30 PM",
      venueId: "arbeiter",
      room: "Taproom",
      speakers: [],
      tags: ["Community", "Networking", "Social"],
      isFeatured: true,
      isSponsored: false,
      attendeeCount: 214,
      updatedAt: "2026-05-27T20:30:00.000Z"
    },
    {
      id: "session-talent-retention",
      slug: "talent-retention-in-scrappy-teams",
      title: "Talent Retention in Scrappy Teams",
      description:
        "People leaders and founders share the rituals, compensation tradeoffs, and management honesty that kept key hires from burning out or wandering off.",
      day: "fri",
      startTime: "10:30 AM",
      endTime: "11:15 AM",
      venueId: "union-depot",
      room: "Waiting Room Hall",
      speakers: [],
      tags: ["People", "Operations", "Community"],
      isFeatured: false,
      isSponsored: false,
      attendeeCount: 98,
      updatedAt: "2026-05-27T11:05:00.000Z"
    },
    {
      id: "session-closing-showcase",
      slug: "closing-showcase-midwest-builders",
      title: "Closing Showcase: Midwest Builders",
      description:
        "A final spotlight block for standout teams, sponsor thank-yous, and the sort of clear closing energy that helps attendees leave with momentum instead of confusion.",
      day: "fri",
      startTime: "3:00 PM",
      endTime: "4:15 PM",
      venueId: "mcnamara",
      room: "Memorial Hall",
      speakers: [],
      sponsorId: "sponsor-matchstick",
      tags: ["Featured", "Community", "Sponsored"],
      isFeatured: true,
      isSponsored: true,
      attendeeCount: 231,
      updatedAt: "2026-05-28T15:05:00.000Z"
    }
  ],
  attachments: [
    {
      id: "attachment-session-fintech-deck",
      ownerType: "session",
      ownerId: "session-fintech",
      title: "FinTech session deck",
      kind: "link",
      url: "https://example.com/tcsw/fintech-deck",
      visibility: "public",
      featured: true,
      uploadedBy: "attendee-maya",
      createdAt: "2026-05-28T18:00:00.000Z"
    },
    {
      id: "attachment-session-investor-brief",
      ownerType: "session",
      ownerId: "session-investor",
      title: "Investor roundtable brief",
      kind: "link",
      url: "https://example.com/tcsw/investor-brief",
      visibility: "internal",
      uploadedBy: "attendee-avery",
      createdAt: "2026-05-28T19:00:00.000Z"
    },
    {
      id: "attachment-sponsor-usbank-guide",
      ownerType: "sponsor",
      ownerId: "sponsor-usbank",
      title: "Small business banking guide",
      kind: "link",
      url: "https://usbank.com/business-banking",
      visibility: "public",
      featured: true,
      uploadedBy: "attendee-rina",
      createdAt: "2026-05-28T16:10:00.000Z"
    }
  ],
  scheduleChanges: [
    {
      id: "change-investor-room",
      sessionId: "session-investor",
      releaseVersion: 3,
      changeType: "room",
      summary: "Investor Roundtable moved to Track B · Carlson 1-130.",
      isPublished: true,
      createdAt: "2026-05-28T18:40:00.000Z",
      createdBy: "Avery Cole"
    },
    {
      id: "change-fintech-materials",
      sessionId: "session-fintech",
      releaseVersion: 4,
      changeType: "materials",
      summary: "FinTech session deck added for attendees.",
      isPublished: false,
      createdAt: "2026-05-29T08:20:00.000Z",
      createdBy: "Maya Brooks"
    }
  ],
  volunteerAssignments: [
    {
      id: "volunteer-checkin-1",
      profileId: "attendee-maya",
      name: "Maya Brooks",
      email: "maya@aurorafreight.co",
      requestedRole: "Check-in",
      assignedRole: "Check-in lead",
      venueId: "umn",
      day: "wed",
      startTime: "8:30 AM",
      endTime: "11:30 AM",
      notes: "Cover welcome desk and overflow wayfinding.",
      status: "assigned"
    },
    {
      id: "volunteer-room-reset-1",
      name: "Jordan Pike",
      email: "jordan@example.com",
      requestedRole: "Room reset",
      assignedRole: "Room reset",
      venueId: "umn",
      day: "fri",
      startTime: "9:00 AM",
      endTime: "12:00 PM",
      notes: "Support founder ops workshop turn.",
      status: "confirmed"
    }
  ],
  notifications: [
    {
      id: "notification-release-3",
      title: "Schedule version 3 is live",
      body: "Wednesday venue and room updates are now reflected in the public schedule.",
      type: "publish",
      createdAt: "2026-05-27T13:05:00.000Z",
      read: false,
      actionHref: "/app/schedule"
    },
    {
      id: "notification-volunteer-1",
      title: "Volunteer shift assigned",
      body: "You are on check-in lead duty at UMN on Wednesday morning.",
      type: "volunteer_assignment",
      createdAt: "2026-05-28T09:00:00.000Z",
      read: false,
      actionHref: "/app/volunteer"
    }
  ],
  sponsorFulfillment: [
    {
      id: "fulfillment-usbank-hero",
      sponsorId: "sponsor-usbank",
      label: "Sponsor page placement",
      detail: "Hero placement on sponsor hub and public sponsor directory.",
      status: "met",
      proof: "Visible on community page and sponsor hub."
    },
    {
      id: "fulfillment-usbank-session",
      sponsorId: "sponsor-usbank",
      label: "Sponsored session presence",
      detail: "FinTech track sponsorship linked to session detail and schedule cards.",
      status: "exceeded",
      proof: "Session, detail page, map context, and analytics views active."
    },
    {
      id: "fulfillment-matchstick-report",
      sponsorId: "sponsor-matchstick",
      label: "Impact report delivery",
      detail: "Sponsor gets reach, sessions, booth, and recap views.",
      status: "met",
      proof: "Sponsor hub sections live."
    }
  ],
  auditLogs: [
    {
      id: "audit-publish-3",
      actor: "Avery Cole",
      action: "Published release version 3",
      subject: "Schedule control",
      createdAt: "2026-05-27T13:00:00.000Z"
    },
    {
      id: "audit-review-bread-butter",
      actor: "Avery Cole",
      action: "Approved submission",
      subject: "What Midwest Investors Want in 2026",
      createdAt: "2026-05-21T08:15:00.000Z"
    }
  ]
};
