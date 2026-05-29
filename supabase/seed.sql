insert into public.venues (id, name, address, lat, lng, transit_notes, parking_notes) values
  ('umn', 'UMN Carlson', '321 19th Ave S, Minneapolis, MN', 44.9727, -93.2436, 'Light rail + East Bank shuttle every 10 minutes.', 'Washington Ave ramp recommended before 10 AM.'),
  ('surly', 'Surly Brewing Co.', '520 Malcolm Ave SE, Minneapolis, MN', 44.9742, -93.2092, 'Five-minute rideshare from UMN East Bank.', 'Overflow parking on Malcolm Ave after 4 PM.'),
  ('stthomas', 'University of St. Thomas', '2115 Summit Ave, St Paul, MN', 44.9402, -93.1896, 'Summit shuttle loop departs every 20 minutes.', 'Reserved guest parking at Anderson deck.'),
  ('mcnamara', 'McNamara Alumni Center', '200 Oak St SE, Minneapolis, MN', 44.9739, -93.2277, 'Easy East Bank light rail walk with direct event signage.', 'Underground parking available off Oak Street.'),
  ('machine-shop', 'The Machine Shop', '300 2nd St SE, Minneapolis, MN', 44.9875, -93.2575, 'Five-minute walk from the riverfront shuttle loop.', 'Surface lots fill early after 5 PM.'),
  ('union-depot', 'Union Depot', '214 4th St E, St Paul, MN', 44.9488, -93.0849, 'Direct Green Line access and rideshare queue at 4th Street.', 'Red ramp is the easiest entry for evening sessions.'),
  ('arbeiter', 'Arbeiter Brewing', '3038 Minnehaha Ave, Minneapolis, MN', 44.9478, -93.2315, 'Blue Line stop is a short walk south on Minnehaha.', 'Neighborhood parking only after 6 PM.')
on conflict (id) do update set
  name = excluded.name,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  transit_notes = excluded.transit_notes,
  parking_notes = excluded.parking_notes;

insert into public.sponsors (id, slug, name, tier, track, description, logo, contact_links, featured_session_ids) values
  ('sponsor-usbank', 'us-bank', 'U.S. Bank', 'Presenting Sponsor', 'FinTech', 'Backing founders with banking tools, venture relationships, and community programming tailored to early-stage operators.', 'US', '{"website":"usbank.com/business-banking","linkedin":"linkedin.com/company/us-bank"}'::jsonb, array['session-fintech','session-founder-finance','session-health-ai']),
  ('sponsor-matchstick', 'matchstick-ventures', 'Matchstick Ventures', 'Stage Sponsor', 'Founders', 'Early-stage venture fund supporting founders from day zero with local network depth and operator-led guidance.', 'MV', '{"website":"matchstickventures.com","linkedin":"linkedin.com/company/matchstick-ventures"}'::jsonb, array['session-investor','session-closing-showcase','session-community']),
  ('sponsor-deed', 'mn-deed', 'MN DEED', 'Community Partner', 'Ecosystem', 'Statewide innovation programs, grants, and ecosystem support for founders, students, and community builders.', 'DE', '{"website":"mn.gov/deed","linkedin":"linkedin.com/company/minnesota-department-of-employment-and-economic-development"}'::jsonb, array['session-community','session-public-sector','session-climate-logistics'])
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  tier = excluded.tier,
  track = excluded.track,
  description = excluded.description,
  logo = excluded.logo,
  contact_links = excluded.contact_links,
  featured_session_ids = excluded.featured_session_ids;

insert into public.speakers (id, name, role, company, bio, avatar, email, profile_id) values
  ('speaker-priya', 'Priya Shah', 'Founder', 'Northstar Pay', 'Payments founder focused on regional SMB cashflow tools.', 'PS', null, null),
  ('speaker-marcus', 'Marcus Lee', 'VP Innovation', 'U.S. Bank', 'Leads startup partnerships and commercial innovation pilots.', 'ML', null, null),
  ('speaker-eden', 'Eden Cho', 'GP', 'Bread & Butter Ventures', 'Backs applied AI and infrastructure founders.', 'EC', 'eden@breadandbutterventures.com', 'attendee-eden'),
  ('speaker-rina', 'Rina Patel', 'CTO', 'Honeycrisp AI', 'Builds production AI systems for operations teams.', 'RP', 'rina@honeycrisp.ai', 'attendee-rina'),
  ('speaker-jules', 'Jules Romero', 'Program Director', 'MN DEED', 'Shapes founder support programs across statewide innovation networks.', 'JR', null, null),
  ('speaker-nia', 'Nia Carter', 'COO', 'Lakeframe', 'Turns messy operator workflows into repeatable systems.', 'NC', null, null)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  company = excluded.company,
  bio = excluded.bio,
  avatar = excluded.avatar,
  email = excluded.email,
  profile_id = excluded.profile_id;

insert into public.profiles (id, email, name, role, app_role, company, bio, avatar, interests, is_discoverable, visible_contact_fields, contact_links, sponsor_id) values
  ('attendee-maya', 'maya@aurorafreight.co', 'Maya Brooks', 'Founder', 'attendee', 'Aurora Freight', 'Building calmer freight ops for distributed teams across the Midwest startup ecosystem.', 'MB', array['Logistics','Operations','AI','Community'], true, array['email','linkedin'], '{"email":"maya@aurorafreight.co","linkedin":"linkedin.com/in/maya-brooks","website":"aurorafreight.co"}'::jsonb, null),
  ('attendee-eden', 'eden@breadandbutterventures.com', 'Eden Cho', 'GP', 'attendee', 'Bread & Butter Ventures', 'Investing in practical AI and connective tissue across the Twin Cities operator community.', 'EC', array['Capital','AI','Community','Growth'], true, array['linkedin'], '{"linkedin":"linkedin.com/in/eden-cho"}'::jsonb, null),
  ('attendee-rina', 'rina@honeycrisp.ai', 'Rina Patel', 'CTO', 'sponsor', 'Honeycrisp AI', 'Operating at the intersection of applied ML, supply chain, and climate-aware infrastructure.', 'RP', array['AI','Climate','Logistics','Product'], true, array['email','website'], '{"email":"rina@honeycrisp.ai","website":"honeycrisp.ai"}'::jsonb, 'sponsor-matchstick'),
  ('attendee-dylan', 'dylan@northlooprobotics.com', 'Dylan Hart', 'Founder', 'host', 'North Loop Robotics', 'Making warehouse robotics less brittle and more human-readable.', 'DH', array['Operations','Product','Demo'], false, array['linkedin'], '{"linkedin":"linkedin.com/in/dylan-hart"}'::jsonb, null),
  ('attendee-avery', 'avery@beta.mn', 'Avery Cole', 'Program Director', 'admin', 'BETA', 'Keeps review, scheduling, sponsors, and event operations moving without losing the human thread.', 'AC', array['Operations','Community','Systems'], false, array['email'], '{"email":"avery@beta.mn"}'::jsonb, null)
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  role = excluded.role,
  app_role = excluded.app_role,
  company = excluded.company,
  bio = excluded.bio,
  avatar = excluded.avatar,
  interests = excluded.interests,
  is_discoverable = excluded.is_discoverable,
  visible_contact_fields = excluded.visible_contact_fields,
  contact_links = excluded.contact_links,
  sponsor_id = excluded.sponsor_id;

insert into public.sessions (id, slug, title, description, day, start_time, end_time, venue_id, room, sponsor_id, speaker_ids, owner_profile_id, tags, is_featured, is_sponsored, capacity, attendee_count, logistics_notes, host_notes) values
  ('session-product-led', 'product-led-growth-midwest-b2b', 'Product-Led Growth for Midwest B2B', 'Operators share the onboarding loops, pricing triggers, and instrumentation choices that actually moved expansion revenue in lean teams.', 'mon', '9:00 AM', '9:45 AM', 'mcnamara', 'Johnson Great Room', null, array[]::text[], null, array['Growth','Product'], true, false, null, 134, null, null),
  ('session-climate-logistics', 'climate-logistics-hard-things', 'Climate Logistics: The Hard Things', 'Founders from freight, manufacturing, and energy trade notes on where climate ambition survives first contact with procurement and margins.', 'mon', '10:15 AM', '11:00 AM', 'mcnamara', 'River Terrace', 'sponsor-deed', array[]::text[], null, array['Climate','Logistics','Community'], false, true, null, 102, null, null),
  ('session-founder-breakfast', 'founder-breakfast-riverfront', 'Founder Breakfast on the Riverfront', 'A loose low-pressure breakfast block for first-time attendees, repeat founders, and operators who want one easy start before the day accelerates.', 'tue', '8:00 AM', '9:00 AM', 'machine-shop', 'Cafe Floor', null, array[]::text[], null, array['Community','Networking','Social'], false, false, null, 156, null, null),
  ('session-revenue-systems', 'revenue-systems-first-25-customers', 'Revenue Systems for the First 25 Customers', 'A working session on founder-led sales handoff, pipeline hygiene, and the dashboards that stop early go-to-market teams from lying to themselves.', 'tue', '11:00 AM', '11:45 AM', 'umn', 'Track D · Carlson 1-140', null, array[]::text[], null, array['Revenue','Systems','Operations'], false, false, null, 118, null, null),
  ('session-happy-hour', 'surly-happy-hour', 'TCSW Happy Hour at Surly', 'Founders, operators, and sponsors unwind across one giant patio with one clear pin and no venue confusion.', 'tue', '4:00 PM', '6:00 PM', 'surly', 'Beer Hall + Patio', null, array[]::text[], null, array['Social','Networking'], true, false, null, 312, null, null),
  ('session-fintech', 'banking-the-next-10m', 'Banking the Next 10M', 'Founders and operators unpack how fintech infrastructure actually scales in the Midwest without losing trust or compliance discipline.', 'wed', '10:00 AM', '10:45 AM', 'umn', 'Track A · Carlson 1-220', 'sponsor-usbank', array['speaker-priya','speaker-marcus'], 'attendee-maya', array['FinTech','Scaling','Sponsored'], true, true, 240, 188, 'Needs lapel mic backup and quick sponsor lower-third review.', 'Confirm founder intro copy and stage timer.'),
  ('session-investor', 'investor-roundtable-midwest-ai', 'Investor Roundtable: Midwest AI', 'Operators and investors share what they fund, what they fear, and what founders should stop putting in seed decks.', 'wed', '10:30 AM', '11:15 AM', 'umn', 'Track B · Carlson 1-130', 'sponsor-matchstick', array['speaker-eden','speaker-rina'], 'attendee-rina', array['AI','Capital','Featured'], true, true, 180, 162, 'Needs two handheld mics and confidence monitor.', 'Confirm investor intros block and reserve overflow seating.'),
  ('session-health-ai', 'health-ai-and-compliance-reality', 'Health AI and Compliance Reality', 'Healthcare founders and operators cut through vapor and explain where responsible AI design still gets strangled by workflow and policy debt.', 'wed', '1:15 PM', '2:00 PM', 'mcnamara', 'Memorial Hall', 'sponsor-usbank', array[]::text[], null, array['AI','Health','Sponsored'], true, true, null, 176, null, null),
  ('session-demo-night', 'demo-night-machine-shop', 'Demo Night at The Machine Shop', 'Founders show product in public, sponsors mingle without awkwardness, and the whole room gets a tighter sense of who is actually shipping.', 'wed', '6:00 PM', '8:00 PM', 'machine-shop', 'Main Floor', null, array[]::text[], null, array['Demo','Community','Social'], true, false, null, 268, null, null),
  ('session-public-sector', 'public-sector-procurement-for-startups', 'Public Sector Procurement for Startups', 'Operators who have actually sold into state and city systems explain the paperwork traps, timing realities, and relationship patterns founders need to know.', 'thu', '9:15 AM', '10:00 AM', 'union-depot', 'Head House', 'sponsor-deed', array[]::text[], null, array['Policy','Community','Capital'], false, true, null, 109, null, null),
  ('session-founder-finance', 'founder-finance-after-seed', 'Founder Finance After Seed', 'A practical teardown of cash planning, burn discipline, and board communication once the celebratory fundraise post has worn off.', 'thu', '11:30 AM', '12:15 PM', 'stthomas', 'Schulze Hall', 'sponsor-usbank', array[]::text[], null, array['FinTech','Capital','Sponsored'], false, true, null, 143, null, null),
  ('session-community', 'building-founder-density', 'Building Founder Density Across Minnesota', 'Community builders compare what actually works when you want more founders to stay, ship, and hire here.', 'thu', '1:00 PM', '1:45 PM', 'stthomas', 'Anderson Hall', 'sponsor-deed', array['speaker-jules'], null, array['Community','Policy'], false, true, null, 121, null, null),
  ('session-community-dinner', 'community-dinner-long-table', 'Community Dinner: Long Table Edition', 'One deliberately social evening block built for loose founder matching, sponsor warmth, and fewer awkward hallway half-conversations.', 'thu', '6:30 PM', '8:30 PM', 'arbeiter', 'Taproom', null, array[]::text[], null, array['Community','Networking','Social'], true, false, null, 214, null, null),
  ('session-ops', 'founder-ops-without-chaos', 'Founder Ops Without Chaos', 'A compact teardown of the systems, dashboards, and habits that keep five-day event weeks from becoming five-alarm fires.', 'fri', '9:30 AM', '10:15 AM', 'umn', 'Track C · Carlson 2-110', null, array['speaker-nia'], 'attendee-dylan', array['Operations','Systems'], false, false, null, 94, 'Workshop table layout and hallway signage requested.', 'Coordinate with ops volunteer lead on room reset.'),
  ('session-talent-retention', 'talent-retention-in-scrappy-teams', 'Talent Retention in Scrappy Teams', 'People leaders and founders share the rituals, compensation tradeoffs, and management honesty that kept key hires from burning out or wandering off.', 'fri', '10:30 AM', '11:15 AM', 'union-depot', 'Waiting Room Hall', null, array[]::text[], null, array['People','Operations','Community'], false, false, null, 98, null, null),
  ('session-closing-showcase', 'closing-showcase-midwest-builders', 'Closing Showcase: Midwest Builders', 'A final spotlight block for standout teams, sponsor thank-yous, and the sort of clear closing energy that helps attendees leave with momentum instead of confusion.', 'fri', '3:00 PM', '4:15 PM', 'mcnamara', 'Memorial Hall', 'sponsor-matchstick', array[]::text[], null, array['Featured','Community','Sponsored'], true, true, null, 231, null, null)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  day = excluded.day,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  venue_id = excluded.venue_id,
  room = excluded.room,
  sponsor_id = excluded.sponsor_id,
  speaker_ids = excluded.speaker_ids,
  owner_profile_id = excluded.owner_profile_id,
  tags = excluded.tags,
  is_featured = excluded.is_featured,
  is_sponsored = excluded.is_sponsored,
  capacity = excluded.capacity,
  attendee_count = excluded.attendee_count,
  logistics_notes = excluded.logistics_notes,
  host_notes = excluded.host_notes;

update public.sessions
set source_submission_id = 'submission-bread-butter'
where id = 'session-investor';

delete from public.saved_schedule
where profile_id in ('attendee-maya', 'attendee-eden', 'attendee-rina', 'attendee-dylan');

insert into public.session_submissions (
  id, title, submitter_name, submitter_email, submitter_profile_id, company, track, format, summary,
  full_description, intended_audience, themes, speaker_details, logistics_needs, submission_resources,
  requested_day, status, internal_notes, decision_note, assigned_reviewer, last_reviewed_at, linked_session_id, created_at
) values
  ('submission-lakeframe', 'Ops Playbooks for Post-Seed Teams', 'Nia Carter', 'nia@lakeframe.com', null, 'Lakeframe', 'Operations', 'Workshop', 'A practical teardown of operator rituals, dashboards, and runbooks that keep lean startup teams from burning out during growth spurts.', 'An operator-led workshop on post-seed operating cadence, dashboard hygiene, decision rituals, and how teams can build processes that survive real growth instead of collapsing under it.', 'Founders, operators, chiefs of staff, and early team leads.', array['Operations','Systems','Growth'], 'Nia Carter, COO at Lakeframe. Looking for one operator co-speaker from a B2B SaaS team.', 'Projector, whiteboard wall, and movable seating for small-group work.', '[{"label":"Lakeframe workshop outline","url":"https://lakeframe.example.com/ops-playbook"}]'::jsonb, 'fri', 'in_review', 'Strong fit. Need final AV requirements and room size estimate.', '', 'Avery Cole', '2026-05-23T10:10:00.000Z', null, '2026-05-22T14:10:00.000Z'),
  ('submission-bread-butter', 'What Midwest Investors Want in 2026', 'Eden Cho', 'eden@breadandbutterventures.com', 'attendee-eden', 'Bread & Butter Ventures', 'Capital', 'Panel', 'A candid look at what investors actually want to see in seed-stage founder updates, fundraising narratives, and technical diligence.', 'A panel for founders who want a clearer read on what investor communications actually build trust in 2026, with practical examples of updates, diligence materials, and traction framing.', 'Seed-stage founders and finance leads.', array['Capital','AI','Growth'], 'Eden Cho will moderate and bring one founder plus one operator-investor into the conversation.', 'Three chairs, handheld microphones, and overflow-friendly seating.', '[{"label":"Panel outline","url":"https://breadandbutter.example.com/midwest-investors"}]'::jsonb, 'wed', 'approved', 'Approved for Wednesday capital block. Pair with operator counterpoint.', 'Approved for the Wednesday capital block pending final lineup confirmation.', 'Avery Cole', '2026-05-21T08:15:00.000Z', 'session-investor', '2026-05-20T09:40:00.000Z'),
  ('submission-northloop', 'Warehouse Robotics Without the Hype', 'Dylan Hart', 'dylan@northlooprobotics.com', 'attendee-dylan', 'North Loop Robotics', 'Hardware', 'Talk', 'An honest breakdown of what breaks first in warehouse robotics deployments and how teams can design around brittle automation assumptions.', 'A talk for operators and technical founders on where robotics pilots fail in warehouses, what assumptions create brittle deployments, and how teams can scope better automation bets.', 'Hardware founders, operators, logistics leads, and technical builders.', array['Operations','Demo','Systems'], 'Dylan Hart, Founder at North Loop Robotics.', 'Confidence monitor if available. Would love room for one table-top hardware demo.', '[{"label":"Talk abstract","url":"https://northloop.example.com/warehouse-robotics"}]'::jsonb, 'thu', 'submitted', '', '', null, null, null, '2026-05-27T16:05:00.000Z')
on conflict (id) do update set
  title = excluded.title,
  submitter_name = excluded.submitter_name,
  submitter_email = excluded.submitter_email,
  submitter_profile_id = excluded.submitter_profile_id,
  company = excluded.company,
  track = excluded.track,
  format = excluded.format,
  summary = excluded.summary,
  full_description = excluded.full_description,
  intended_audience = excluded.intended_audience,
  themes = excluded.themes,
  speaker_details = excluded.speaker_details,
  logistics_needs = excluded.logistics_needs,
  submission_resources = excluded.submission_resources,
  requested_day = excluded.requested_day,
  status = excluded.status,
  internal_notes = excluded.internal_notes,
  decision_note = excluded.decision_note,
  assigned_reviewer = excluded.assigned_reviewer,
  last_reviewed_at = excluded.last_reviewed_at,
  linked_session_id = excluded.linked_session_id,
  created_at = excluded.created_at;

insert into public.schedule_controls (id, is_published, locked_at, published_at, announcement, release_version, has_unpublished_changes, last_published_by, last_edited_at) values
  ('tcsw-2026', true, '2026-05-26T18:30:00.000Z', '2026-05-27T13:00:00.000Z', 'Schedule is live. Only approved session edits should move after publish.', 3, true, 'Avery Cole', '2026-05-29T08:45:00.000Z')
on conflict (id) do update set
  is_published = excluded.is_published,
  locked_at = excluded.locked_at,
  published_at = excluded.published_at,
  announcement = excluded.announcement,
  release_version = excluded.release_version,
  has_unpublished_changes = excluded.has_unpublished_changes,
  last_published_by = excluded.last_published_by,
  last_edited_at = excluded.last_edited_at;

insert into public.attachments (id, owner_type, owner_id, title, kind, url, visibility, featured, uploaded_by) values
  ('attachment-session-fintech-deck', 'session', 'session-fintech', 'FinTech session deck', 'link', 'https://example.com/tcsw/fintech-deck', 'public', true, 'attendee-maya'),
  ('attachment-session-investor-brief', 'session', 'session-investor', 'Investor roundtable brief', 'link', 'https://example.com/tcsw/investor-brief', 'internal', false, 'attendee-avery'),
  ('attachment-sponsor-usbank-guide', 'sponsor', 'sponsor-usbank', 'Small business banking guide', 'link', 'https://usbank.com/business-banking', 'public', true, 'attendee-rina')
on conflict (id) do update set
  owner_type = excluded.owner_type,
  owner_id = excluded.owner_id,
  title = excluded.title,
  kind = excluded.kind,
  url = excluded.url,
  visibility = excluded.visibility,
  featured = excluded.featured,
  uploaded_by = excluded.uploaded_by;

insert into public.schedule_changes (id, session_id, release_version, change_type, summary, is_published, created_by, created_at) values
  ('change-investor-room', 'session-investor', 3, 'room', 'Investor Roundtable moved to Track B · Carlson 1-130.', true, 'attendee-avery', '2026-05-28T18:40:00.000Z'),
  ('change-fintech-materials', 'session-fintech', 4, 'materials', 'FinTech session deck added for attendees.', false, 'attendee-maya', '2026-05-29T08:20:00.000Z')
on conflict (id) do update set
  session_id = excluded.session_id,
  release_version = excluded.release_version,
  change_type = excluded.change_type,
  summary = excluded.summary,
  is_published = excluded.is_published,
  created_by = excluded.created_by,
  created_at = excluded.created_at;
