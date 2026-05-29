# Open Source Donor Matrix

Date: 2026-05-29
Project: TCSW BETA App

This note turns the pretalx and indico review into a practical donor plan.

## Bottom line

We should not adopt either platform wholesale.

The better split is:

- use `pretalx` as a workflow and data-model reference
- use `indico` as a safer code and UX donor where appropriate
- keep the current Next.js app as the actual product shell

## Important licensing note

### pretalx

The copy in this workspace is not a simple Apache-only codebase.

The current project license here is effectively:

- AGPL-based
- with additional terms

That means it is not a good candidate for direct code lifting into this product unless we stop and do a proper legal review.

Safe use:

- study architecture
- study workflow design
- imitate ideas
- recreate logic patterns ourselves

Riskier use:

- copying implementation code
- adapting backend modules directly
- embedding pretalx-derived server logic into the product

### indico

Indico is under MIT, which makes it much safer as a donor for patterns and possibly selective implementation ideas.

## Best donor split

### Use pretalx for:

- submission workflow structure
- review and approval state model
- scheduling and release workflow concepts
- speaker/session metadata design
- schedule change / unreleased changes concepts
- API/export shape ideas

### Use indico for:

- registration patterns
- badge/ticket ideas
- attachments/materials handling
- room and venue management ideas
- search/export/admin UI patterns
- richer sponsor/admin operational surfaces

## What we already have vs what we still need

### Already built in current app

- attendee schedule
- saved week / personal schedule
- map with venue context
- sponsor directory and sponsor hub
- admin review surface
- host workspace
- submission form
- role-based navigation

### Still worth deepening

- richer submission workflow
- richer registration flow
- better attachments/material support
- stronger schedule export / publish pipeline
- stronger admin/ops reporting
- badge/ticket layer later

## Concrete donor opportunities

### 1. Submission and review workflow

Best donor: `pretalx`

Why:

- this is one of pretalx's strongest core domains
- it already thinks in submissions, review states, questions, speakers, and scheduling

Useful pretalx areas:

- `src/pretalx/submission`
- `src/pretalx/cfp`
- `src/pretalx/mail`

What to borrow:

- submission states and transitions
- question-driven intake structure
- reviewer notes / review phase concepts
- submitter follow-up patterns

How to use it:

- mirror the workflow shape
- do not copy implementation directly

Priority:

- high

### 2. Schedule release and update handling

Best donor: `pretalx`

Why:

- our app already has draft/live thinking
- pretalx has a more mature concept of schedule release and unreleased changes

Useful pretalx areas:

- `src/pretalx/schedule`
- `src/pretalx/api`

What to borrow:

- schedule release concepts
- change visibility concepts
- export ideas
- attendee-safe publish model

How to use it:

- adapt conceptually into our own state model

Priority:

- high

### 3. Attachments, slides, supporting materials

Best donor: `indico`

Why:

- this is operationally useful and very normal for event software
- indico has a dedicated attachments module

Useful indico areas:

- `indico/modules/attachments`

What to borrow:

- attachments UI structure
- upload/display organization
- content grouping patterns
- admin and public-view separation

How to use it:

- likely safe to borrow patterns more directly than pretalx

Priority:

- medium-high

### 4. Registration workflow

Best donor: `indico`

Why:

- indico has a mature registration module
- your product still needs stronger event participation flow eventually

Useful indico areas:

- `indico/modules/events/registration`

What to borrow:

- invitation handling
- registration tags
- consent patterns
- form-builder ideas
- attendee status management

How to use it:

- study UX and data model now
- implement after current attendee core is fully stable

Priority:

- medium

### 5. Badge and ticket ideas

Best donor: `indico`

Why:

- indico explicitly supports badge/ticket editing
- this is likely much closer to your future needs than pretalx

Useful indico areas:

- registration and badge-related files under `events/registration`

What to borrow:

- badge editor concepts
- printable/ticket artifact patterns
- admin fulfillment flow ideas

Priority:

- later, but strong donor area

### 6. Room and venue operations

Best donor: `indico`

Why:

- indico has a substantial room booking / room details area
- TCSW is multi-venue and navigation-heavy

Useful indico areas:

- `indico/modules/rb`

What to borrow:

- room metadata model
- room details UX
- venue search/filter patterns
- availability / occupancy thinking

Priority:

- medium-high

### 7. Search and export

Best donor: `indico`

Why:

- the product is already growing into a multi-surface operations system
- better search/export will matter more over time

Useful indico areas:

- `indico/modules/search`
- `indico/modules/events/export.py`
- `indico/modules/users/export.py`

What to borrow:

- admin search structure
- export patterns
- scoping/filter design

Priority:

- medium

### 8. Speaker and session API design

Best donor: `pretalx`

Why:

- pretalx has a mature speaker/session/schedule API orientation

Useful pretalx areas:

- `src/pretalx/api`
- `src/pretalx/submission`
- `src/pretalx/schedule`

What to borrow:

- response shape ideas
- entity naming
- export conventions

Priority:

- medium-high

## What not to borrow

### Do not borrow directly from pretalx:

- whole backend modules
- server implementation code
- embedded admin screens
- templating structure

Reason:

- license risk
- wrong stack shape for this app
- would likely cost more to adapt than to reproduce cleanly

### Do not adopt all of indico:

- the whole event-management worldview is broader than your product
- many modules solve problems you do not need yet
- full adoption would bloat the product quickly

## Recommended next build order from this donor review

### Phase 1

- strengthen submissions and review workflow using pretalx concepts
- strengthen schedule release/change model using pretalx concepts

### Phase 2

- add materials/attachments using indico patterns
- deepen venue/room model using indico room ideas

### Phase 3

- improve registration flow using indico registration patterns
- improve export/search/admin tooling using indico patterns

### Phase 4

- revisit badge/ticket layer later when ticketing becomes active scope

## Best immediate next moves

If we want to act on this right away, the strongest next steps are:

1. review pretalx submission state and question model, then tighten our intake/review flow
2. review pretalx schedule release model, then improve publish/change tracking in our app
3. review indico attachments module, then add session/sponsor materials support

## Short summary

If pretalx and indico are “donor organs,” then:

- pretalx should donate process logic
- indico should donate operational UI and implementation ideas
- this app remains the body everything plugs into
