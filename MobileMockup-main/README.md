# TCSW 2026 — Mobile Event App Mockup

A single-page, **static HTML mockup** of the Twin Cities Startup Week 2026
companion app, presented as a scroll-through narrative ("scrollytelling"). It
doubles as a **clickable concept pitch** and a **design/UX reference** you can
fork into a real prototype.

There is **no build step, no framework, no dependencies** — just `index.html`,
one stylesheet, one small script, and a couple of image assets. Open it in a
browser and it runs.

> **Forking this?** Jump to [Fork it into your own prototype](#fork-it-into-your-own-prototype)
> and [For an AI coding agent](#for-an-ai-coding-agent).

---

## 1. Quick start

```bash
# Any static file server works. From the repo root:
python3 -m http.server 3000
# → open http://localhost:3000
```

A ready-made dev-server config also lives in `../.claude/launch.json` (config
name `tcsw`, port 3000) for editors that read it. Because every asset path is
relative (`css/styles.css`, `js/scroll-progress.js`, `assets/…`), the page also
works when served from a sub-path or a CDN (e.g. raw.githack.com) with no
changes.

**Requirements:** a modern evergreen browser (uses `content-visibility`,
CSS `mask`, `scroll-snap`, `aspect-ratio`, `zoom`). No Node, no npm.

---

## 2. Repository layout

```
tcsw-mockup/
├── index.html              # All markup. Read top→bottom = the narrative.
├── css/
│   └── styles.css          # All styling. Design tokens live in :root.
├── js/
│   └── scroll-progress.js  # The ONLY script: the walkthrough progress stepper.
├── assets/
│   ├── tcsw-logo.png       # Real TCSW lockup (white-on-transparent; CSS-tinted gold)
│   └── maya-qr.png         # QR code shown on the badge/check-in screen
└── README.md               # You are here.
```

Everything is intentionally flat and framework-free so the *patterns* are easy
to lift, not the tooling.

---

## 3. Design system

The brand mirrors the live site, **tcstartupweek.com**. **Every color and font
is a CSS custom property declared once in `:root`** (top of `css/styles.css`),
so re-theming the entire app is a single-block edit.

### Color tokens

| Token            | Value      | Role                                            |
| ---------------- | ---------- | ----------------------------------------------- |
| `--midnight`     | `#0c495a`  | **Primary brand teal** — dark backgrounds       |
| `--indigo`       | `#0e5a70`  | Lifted teal — gradient partner for `--midnight` |
| `--teal-soft`    | `#e6eef1`  | Pale teal — light fills                         |
| `--gold`         | `#fbbd19`  | **Primary accent** — CTAs, highlights, logo     |
| `--gold-deep`    | `#e0a510`  | Darker gold — hover / depth                     |
| `--gold-soft`    | `#fdd97a`  | Soft warm gold                                  |
| `--ink`          | `#1a1a1a`  | Primary body text on light                      |
| `--muted`        | `#5a6a72`  | Secondary / muted text                          |
| `--paper`        | `#f5f7f8`  | Light section background                        |
| `--line`         | `#dbe4e8`  | Hairline borders                                |
| `--aurora`/`-deep` | `#4ad7c0`/`#2ba893` | Secondary teal-green (sparingly)     |
| `--coral`        | `#ff6b6b`  | Category accent (session tags)                  |
| `--plum`         | `#6b3aa0`  | Rare accent                                     |

> Names are historical (`--midnight` is now teal, not navy). They're kept stable
> so the cascade doesn't churn — **change the value, not the name**, to re-skin.

### Type

| Role     | Family       | Weights used | Loaded via             |
| -------- | ------------ | ------------ | ---------------------- |
| Display  | **Montserrat** | 500–900    | Google Fonts (`<head>`) |
| Body/UI  | **Inter**      | 400–900    | Google Fonts (`<head>`) |

Headings use `font-family: 'Montserrat'`; everything else inherits Inter from
`body`.

### Other conventions

- **Radii:** pills `999px`; cards `10–18px`; phone frames `~36–48px`.
- **Uppercase + letter-spacing** for eyebrows, nav, buttons, badges.
- **Backdrops:** flat teal gradient + a faint "blueprint" grid + sparse
  wireframe rectangles (the site's motif). No diagonal-stripe artwork — that was
  an earlier design and has been removed everywhere.

---

## 4. Page anatomy

`index.html` reads top→bottom as one narrative. Each major block is delimited by
a `<!-- ==== NAME ==== -->` banner comment:

| Order | Block (class)              | What it is                                                                 |
| ----- | -------------------------- | -------------------------------------------------------------------------- |
| 1 | **Hero** (`.hero`)             | Concept headline ("Five days. Six campuses…") + meta chips.                |
| 2 | **App preview** (`.web-hero` inside `.website-frame`) | A faithful mock of **tcstartupweek.com** (nav, logo, gold date pill, white+gold headline, real CTAs) with **two app phones embedded** and a stats strip. This is "our app, on their site." |
| 3 | **Demo stage** (`.demo-stage` → `.scene`) | "Meet Maya" persona intro, then **8 feature scenes**. Each scene is a **full-frame panel** that scroll-snaps into view, pairing narrative copy with a phone screen. |
| 4 | **Architecture** (`.arch-section`) | Plain-English production stack + "Maya's path" walkthrough.            |

### The 8 walkthrough scenes

```
01 Session Catalog     02 Session Detail (one-tap sign-up)
03 My Agenda           04 Event Map (street view → Surly Brewing)
05 Community + Connect  06 Ticket / Badge (Eventbrite QR + push notif)
07 Sponsor Dashboard   08 BETA.MN + Attentio partnership (closing)
```

---

## 5. Component catalog

Reusable, copy-pasteable patterns (all pure HTML+CSS). Class → purpose:

**Device & app shell**
- `.phone`, `.phone.android` — device frame. The screen uses
  `aspect-ratio: 9 / 19.5`, so **height follows width**. To shrink a whole phone
  (frame *and* its fixed-px content) uniformly, scale with `zoom`, not `width`
  (changing width reflows content and clips it).
- `.phone-screen`, `.status-bar`, `.notch`, `.home-indicator`, `.hole-punch`,
  `.nav-pill-android` — device chrome.
- `.app-banner` — in-app header (teal + faint grid). `.banner-title`,
  `.banner-sub`, `.banner-eyebrow`.
- `.tab-bar` / `.tab-item` — bottom nav. The app's 6 tabs:
  **Sessions · Agenda · Map · Connect · Community · Profile**.

**Content patterns**
- `.day-strip` / `.day-chip` — horizontal date selector.
- `.session-list` → `.session-card` (`+.featured`, `+.sponsored`) → `.sc-tag`
  (`.indigo`/`.green`/`.gold`/`.coral` category pills), `.sc-title`, `.sc-meta`.
- `.pd-screen` → `.pd-hero` / `.pd-section` / `.pd-list` / `.pd-contact` —
  a detail/profile screen (sponsor profile, etc.).
- `.sponsor-hero` / `.tier-row` / `.sponsor-grid` / `.sp-card` — directory grid.

**Narrative scaffolding**
- `.scene` / `.scene-head` / `.scene-num` (step badge) / `.scene-title` /
  `.scene-sub` / `.scene-grid` (2-col copy|phone) / `.scene-copy` / `.bullet-list`.
- `.scroll-progress` (fixed stepper) → `.sp-track` / `.sp-fill` / `.sp-pill`.

**Marketing-site mock**
- `.web-nav` / `.web-logo` (gold-masked real logo) / `.web-nav-right`.
- `.web-hero` / `.date-pill` / `.hero-btn` (`.primary` / `.ghost`) /
  `.web-phone-cluster` / `.web-body-strip` (`.web-feat`).

---

## 6. The walkthrough mechanics

This is the one piece of "logic." Three cooperating parts:

1. **Full-frame panels (CSS).** Each `.scene` is `min-height: 100vh` with its
   content vertically centered, and `scroll-snap-align: start`. The root sets
   `scroll-snap-type: y proximity` (gentle — the hero/site sections still scroll
   freely). Result: scrolling the walkthrough *settles* one step at a time, with
   the step's header **and** phone visible together. Scene phones are scaled with
   `zoom` so every step fits one viewport; multi-phone "showcase" scenes
   (`.phone-wrap.dual`) scale down further.

2. **Progress stepper (`js/scroll-progress.js`).** A small IIFE (no globals) that:
   - measures each `.scene`'s document offset **once** (re-measured on resize,
     font load, and `ResizeObserver` — see perf notes), then
   - on scroll (rAF-throttled), drives the fixed bar via
     `transform: scaleX(0…1)` and updates the "Step N / 8" label.

3. **Off-screen skipping (CSS).** `.scene` and `.arch-section` use
   `content-visibility: auto` + `contain-intrinsic-size`, so the browser skips
   layout/paint for steps that aren't near the viewport.

> ⚠️ **Gotcha that ties #2 and #3 together:** `content-visibility: auto` lets an
> off-screen scene resolve to its *estimated* height and only assume its true
> height when it nears the viewport — which shifts every later scene's offset.
> `scroll-progress.js` therefore re-measures on a `ResizeObserver` (and on the
> `contentvisibilityautostatechange` event) so the bar stays accurate. If you
> change scene sizing, keep that re-measure path.

---

## 7. Performance playbook

The page is long and paint-heavy (many gradient/shadow phone mockups), so it
follows a few rules. Keep them if you extend it:

- **Composite, don't repaint on scroll.** The fixed progress bar and its fill
  are layer-promoted (`will-change: transform`) and animate **`transform`**, never
  `width`/`top`.
- **No `backdrop-filter`.** It re-blurs every paint → scroll jank. Removed
  everywhere; use solid/again-translucent backgrounds instead.
- **`content-visibility: auto`** on the big off-screen blocks (scenes, arch).
- **No layout reads on scroll.** Scene offsets are cached; scroll handlers only
  do arithmetic + a composited write.
- **Continuous animations** (e.g. the map pin pulse) animate only
  `transform`/`opacity` and carry `will-change`.

---

## 8. Intended production architecture

The mockup pitches **"don't build from scratch — wire four trusted tools."**
This is the target stack a real prototype would implement (summarized from the
in-page Architecture section):

| Concern              | Tool            | Responsibility                                             |
| -------------------- | --------------- | ---------------------------------------------------------- |
| Native shell         | **Capacitor**   | Wrap the one web build → iOS (App Store) + Android (Play). |
| Tickets & check-in   | **Eventbrite**  | Ticket sales, refunds, and the **QR** scanned at the door. |
| Maps & directions    | **Mapbox**      | Real streets, pins, walking directions to venues.          |
| Data & accounts      | **Supabase**    | Postgres + row-level security: sessions, speakers, sponsors, RSVPs, profiles, auth. The "brain." |
| Hosting              | **Vercel** (or similar) | Deploy the single web app codebase.                |

**App surface (6 tabs):** Sessions · Agenda · Map · Connect · Community · Profile.

**The attendee path the app must support (from `Meet Maya` → close):**
1. Buy ticket on Eventbrite (no new account).
2. Tap "Get App" on the website → store → install (Capacitor build).
3. Browse **Sessions** catalog → tap to sign up → it lands in **Agenda** (no double-entry).
4. Tap a session → one pin on the **Map** (Mapbox) with directions.
5. Check in on-site with the **same Eventbrite QR**, surfaced in-app.
6. **Community/Connect**: opt-in attendee + sponsor directory.

---

## 9. Fork it into your own prototype

This mockup is built to be *lifted*. Recommended path:

1. **Re-skin in one place.** Edit the color values + font names in `:root`
   (`css/styles.css`) and the `<link>` fonts in `<head>`. The whole app retints.
2. **Swap the logo.** Replace `assets/tcsw-logo.png` (white-on-transparent
   silhouette). It's recolored to `--gold` via CSS `mask` on `.web-logo`, so a
   silhouette PNG "just works" in any brand color.
3. **Reuse the components** from §5 as your design language (phone shell, cards,
   tabs, scenes). They're vanilla HTML/CSS — paste into React/Vue/Svelte and
   replace inline content with props/state.
4. **Keep the walkthrough mechanics** (§6) if you want a scrollytelling pitch;
   drop them if you're building the real app (you only need the *screens*, i.e.
   the contents of each `.phone-screen`).
5. **Wire the production stack** (§8) behind those screens.

**What's mock vs. real:** every phone screen is static HTML — there is no data
layer, routing, or state. The screens are faithful **UI targets**; treat each
`.phone-screen` as the spec for one real app view.

---

## 10. For an AI coding agent

If you're an AI asked to turn this into a working app, here's the contract:

- **Source of truth for visuals:** the markup inside each `.phone-screen` in
  `index.html` is the pixel-level spec for one app view. The design tokens in
  `:root` (§3) are the theme. Reproduce these exactly, then make them dynamic.
- **Build the 6 tabs** (§8) as routes/views: Sessions, Agenda, Map, Connect,
  Community, Profile. The `.session-card`, `.day-strip`, `.tab-bar`,
  `.pd-screen`, and `.sponsor-grid` patterns map directly to components.
- **Data model (Supabase / Postgres):** `sessions`, `speakers`, `sponsors`,
  `rsvps` (attendee↔session), `profiles`, with row-level security. "Sign up for
  a session" = insert an `rsvp`; "My Agenda" = the attendee's RSVPs.
- **Integrations:** Eventbrite (tickets + QR check-in), Mapbox (one pin per
  session venue + directions), Capacitor (package the web build for iOS/Android).
- **Do NOT** invent a new visual language — re-theme via the tokens. **Do NOT**
  add a backend to *this* repo; this repo stays a static mockup. Generate the
  real app in a new project that imports these screens as its UI spec.

---

## 11. Conventions & constraints

- **No build step.** Plain HTML/CSS/JS, served statically. Keep it that way here.
- **One stylesheet, one script.** Don't add bundlers/frameworks to this repo.
- **Vanilla JS, IIFE-scoped**, no globals, progressive-enhancement friendly
  (the page is fully readable with JS disabled; only the progress bar is JS).
- **Comment the *why*.** Section banners + inline notes explain non-obvious
  decisions (perf tradeoffs, the content-visibility/measure interplay, etc.).
- **Accessibility:** semantic landmarks, `aria-*` on the progress bar, `alt`/
  `aria-label` on imagery. Maintain these when editing.

---

*This mockup emulates the public design of tcstartupweek.com for an internal
concept pitch. Brand marks (TCSW, BETA.MN, Attentio) belong to their owners.*
