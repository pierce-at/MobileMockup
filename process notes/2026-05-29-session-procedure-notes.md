# Session Procedure Notes

Date: 2026-05-29
Project: TCSW BETA App
Status: Active working record

## Purpose

This note records how the work was carried out, not just what files changed.  
Use it as a repeatable pattern for future sessions so product, design, and engineering work stay easier to track.

## Documentation Approach Used

This note follows lightweight ADR-style and procedural-documentation best practices:

- Keep records in Markdown next to the project.
- Capture context, decisions, and consequences instead of writing a long narrative.
- Prefer one focused record for one working session or decision cluster.
- Write procedures as short numbered steps with action-first wording.
- Keep the record easy to scan and easy to update later.

Reference guidance:

- [MADR / ADR guidance](https://adr.github.io/madr/)
- [Architecture Decision Record examples](https://github.com/architecture-decision-record/architecture-decision-record)
- [Google developer documentation: procedures](https://developers.google.com/style/procedures)

## Session Working Procedure

1. Review current app state before changing anything.
   Read the existing routes, major UI surfaces, and app-state patterns first.

2. Use the source-of-truth HTML as design authority.
   For visual work, compare the live app against the provided HTML patterns before changing layout, spacing, typography, or color.

3. Separate product-core work from polish work.
   Build or fix behavior first, then align styling once the behavior is stable enough to evaluate.

4. Preserve architecture seams while iterating.
   Keep repository interfaces, role separation, and route structure intact even while improving UI and workflow details.

5. Prefer additive changes over reinvention.
   Extend current screens, components, and shared state instead of replacing working systems without a strong reason.

6. Validate after each meaningful change set.
   Run lint and tests after grouped changes instead of waiting until the very end.

7. Keep role-specific behavior explicit.
   Check attendee, sponsor, admin, and host flows separately whenever a shared component might leak behavior across roles.

8. Record patterns that should repeat.
   When a useful workflow emerges, write it down so the next session starts with a cleaner operating procedure.

## Practical Procedure Followed This Session

### 1. Product and design alignment

1. Compare current UI against the source-of-truth markup.
2. Identify mismatches in hierarchy, spacing, typography, and navigation behavior.
3. Adjust shared surfaces first, then page-level details.
4. Recheck mobile behavior after each major visual pass.

### 2. Role and workflow hardening

1. Confirm which screens belong to attendee, sponsor, host, and admin roles.
2. Hide or reroute features that do not belong on a given role surface.
3. Keep onboarding and personalization limited to the user types that actually need them.
4. Re-verify navigation after any role-based visibility change.

### 3. Sponsor-hub expansion

1. Build a role-specific navigation shell before deepening page content.
2. Add subpages for each operational area rather than packing everything into one dashboard.
3. Wire event logging into sponsor interactions so analytics pages have a real data path.
4. Tune the dashboard styling to match the cleaner analytics design in the source of truth.

### 4. Mobile-first adjustment loop

1. Check narrow-width rendering after each layout change.
2. Remove overflow before adding more visual complexity.
3. Keep tap targets intact while shrinking supporting UI.
4. Make primary content readable without zoom.

### 5. Navigation and orientation improvements

1. Identify any area where the user must remember routes manually.
2. Add an explicit directory or route hub rather than expecting memory.
3. Surface the hub from obvious entry points, not just one hidden route.
4. Keep page grouping aligned with actual roles and workflows.

## Quality-Control Procedure

Use this same closeout sequence after future sessions:

1. Run `npm run lint`
2. Run `npm test`
3. Run `npx tsc --noEmit` if TypeScript-heavy changes were involved
4. Manually spot-check the affected routes in mobile view
5. Confirm no role-inappropriate UI appears in sponsor/admin surfaces
6. Confirm newly added navigation paths are reachable from at least one obvious screen

## Process Decisions Captured

### Decision: Keep session notes procedural, not exhaustive

Context:
This project is moving quickly across design, product, data, and role-based flows. Exhaustive narrative notes would become noisy and hard to reuse.

Decision:
Record the working procedure, validation pattern, and decision logic instead of a minute-by-minute change diary.

Consequences:

- Future sessions can restart faster.
- Team members can reuse the same work pattern.
- Some low-level file-by-file detail will live in git history instead of process notes.

### Decision: Treat source-of-truth HTML as a standing design reference

Context:
The product already has a strong visual direction in the provided HTML demo.

Decision:
Use the HTML as the reference point for major UI decisions instead of inventing a parallel design language.

Consequences:

- Design consistency stays higher.
- Styling work becomes comparison-driven instead of arbitrary.
- Some screens still need adaptation where the live app has more real functionality than the demo.

### Decision: Keep a clickable route directory inside the product

Context:
As the app gained attendee, sponsor, admin, workspace, and dynamic routes, it became harder to keep track of entry points.

Decision:
Add an internal app-map page and surface it from the homepage and profile.

Consequences:

- QA and demos become easier.
- New contributors can orient themselves faster.
- The route hub must be kept updated as the app grows.

## Recommended Ongoing Procedure

For future records in this folder:

1. Create one Markdown file per meaningful session or decision cluster.
2. Name files by date first so they sort naturally.
3. Keep sections consistent:
   - Purpose
   - Procedure followed
   - Decisions captured
   - Validation performed
   - Next-session checklist
4. Link to source references when a process or decision came from outside guidance.
5. Keep records short enough that someone can reread them in under five minutes.

## Suggested Next-Session Checklist

- Review the app map before starting new work.
- Recheck sponsor/admin role surfaces for any attendee-only leakage.
- Continue product-core work before adding packaging complexity.
- Add a new note here after any session that changes workflow, architecture, or team operating procedure.
