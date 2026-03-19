# Timeline

The timeline view shows the chronological story of Operation Metro Surge through two layers:

1. **Curated highlight moments** — Manually written narrative cards that tell the key story beats (36 currently)
2. **Auto-generated incident dots** — Every published incident appears automatically as a clickable day-cluster

Regular incidents require no manual timeline work. Only the highlight moments are curated.

## How It Works

### Data Flow

1. `timeline.js` fetches monthly moment files (`docs/data/timeline-moments-YYYY-MM.md`), loading the newest month first for fast initial render, then loading remaining months in the background
2. `timeline.js` pulls all incidents from `App.getFilteredIncidents()` (the category JSON files)
3. Both are merged into a single chronological timeline, grouped by month
4. As the user scrolls, a sticky totals bar shows running category counts up to the current date

### Files

| File                                    | Purpose                                            |
| :---------------------------------------| :--------------------------------------------------|
| `docs/data/timeline-moments-YYYY-MM.md` | Curated highlight moment data (one file per month) |
| `docs/js/timeline.js`                   | Rendering, scroll behavior, click handlers         |
| `docs/css/timeline.css`                 | All timeline styles (isolated from main CSS)       |

## Moment Format

Each moment in the monthly files (`timeline-moments-YYYY-MM.md`) is a YAML frontmatter block followed by a narrative body, separated by `---`:

```markdown
---
date: 2026-01-07
title: Renee Good Killed by ICE Agent
incident: 2026-01-07-renee-good-shooting
source:
---
The first fatal shooting. Renee Nicole Macklin Good, 37, a writer, poet, and mother of three...
```

### Fields

| Field      | Required | Description                                                                             |
| :----------| :--------| :---------------------------------------------------------------------------------------|
| `date`     | Yes      | ISO date (YYYY-MM-DD). Determines position on timeline                                  |
| `title`    | Yes      | Card headline. Keep concise but descriptive                                             |
| `incident` | No       | Incident slug. Makes the card clickable → opens lightbox. Also auto-loads OG image      |
| `source`   | No       | External URL. Used when the moment links to an outside article instead of an incident   |
| `image`    | No       | Custom image path. Overrides the auto-loaded OG image. Set to `false` to suppress image |

### Body Text

- Write in documentary tone, past tense
- Use markdown links for cross-references to other incidents: `[text](/entry/slug)`
- Links to `/entry/` slugs open in the lightbox (not navigated away)
- Keep to 2-4 sentences for most moments; major turning points can be longer
- A moment can reference multiple incidents by linking to them in the body

### Image Loading Priority

1. Custom `image` field (if set and not `false`)
2. OG image from linked `incident` (`localMediaOgPath`)
3. Primary media from linked `incident` (if image type)
4. No image (text-only card)

## Adding a Moment

1. Open the appropriate monthly file (e.g., `docs/data/timeline-moments-2026-01.md`)
2. Add a new block at the correct chronological position (moments should be in date order within each file)
3. Use `---` separators between blocks (blank line + `---` + newline before new block)
4. Link to an incident slug if one exists, or provide an external `source` URL
5. Write the narrative body

### When to Add a Moment

Add a moment when an incident or event:
- Was a **turning point** in the operation's narrative (first of its kind, escalation, legal milestone)
- **Went viral** or received widespread media coverage
- Represents a **pattern** that affected many people (not just a single incident)
- Had **lasting consequences** (lawsuits, policy changes, protests)
- Provides essential **context** readers need to understand the timeline (federal announcements, legal rulings)

Not every notable incident needs a moment card. The `notable: true` flag on incidents (see `notable-incidents.md`) is for highlighting important cases in the list view. Timeline moments are for the narrative arc — the story of how the operation unfolded.

### Background Entries and Timeline Visibility

Entries with `type: background` (lawsuits, federal announcements, surveillance programs, etc.) appear in the `/list/background` list view and as small day-cluster dots on the timeline — but **they do not get curated moment cards unless explicitly added to the monthly moment files**. Because background entries lack the visual prominence of moment cards, they are easy for readers to miss on the timeline.

When creating a new background entry, decide whether it warrants a timeline moment:
- **If it relates to an existing moment** — fold a reference into that moment's body text (e.g., a school lawsuit folded into the school closures moment). This is preferred.
- **If it's a standalone turning point** — give it its own moment card (e.g., the state suing to halt the operation).
- **If it's important context but not a narrative beat** — leave it as a background entry only. It will still appear in the list view and as a timeline dot.

### One Moment Per Topic

**Each timeline highlight should cover a single topic/incident.** When a story develops over time (e.g., a child is detained, then released, then faces deportation proceedings), fold the updates into the original moment's body text rather than creating separate moments for each development.

This keeps the timeline from being cluttered with multiple cards about the same story. Write updates chronologically within the body: "On February 1, Judge Biery orders their release... On February 6, DHS files removal proceedings..."

**Exceptions exist** — distinct legal actions (e.g., two separate ACLU lawsuits with different plaintiffs and claims) warrant their own moments even if they involve related themes. Use judgment: if it's a genuinely new incident or legal filing, it gets its own card. If it's a development in an existing story, fold it in.

## Reviewing the Timeline

When asked to **"review the timeline"** or **"check the timeline for gaps"**:

### Step 1: Load Current State

1. Read the monthly moment files (`docs/data/timeline-moments-*.md`) to see existing moments (dates and titles)
2. Read `docs/data/search-index.md` to see all published incidents

### Step 2: Identify Gaps

Compare incidents against moments looking for:

- **Missing turning points** — Incidents with `notable: true` that don't have corresponding moments
- **Chronological gaps** — Long stretches (5+ days) with incidents but no narrative moment
- **Pattern representation** — Are all major enforcement patterns represented? (citizen detentions, child detentions, observer targeting, use of force, school raids, hospital incidents, workplace enforcement, legal challenges, federal response)
- **Under-told stories** — Incidents with high trustworthiness and strong media coverage that could anchor a narrative beat

### Step 3: Check Narrative Flow

Read the moments in order and verify:
- The story builds logically from launch → escalation → turning points → response
- Each moment card connects to the larger narrative (not isolated facts)
- Cross-references link related moments together where appropriate
- No moment is redundant with another

### Step 4: Report

Present findings as:
1. **Recommended additions** — New moments to add, with suggested date, title, and brief description
2. **Edits to existing** — Moments that need updating (new cross-links, factual corrections, wording)
3. **No action needed** — Confirm the timeline is comprehensive if no gaps found

## Code Overview

### timeline.js (~497 lines)

**Global Object:** `Timeline`

| Method                    | Purpose                                                                            |
| :-------------------------| :----------------------------------------------------------------------------------|
| `render()`                | Entry point. Initializes if needed, builds HTML, sets up handlers                  |
| `init()`                  | Loads newest month's moments for fast initial render                               |
| `loadRemainingMonths()`   | Background-loads older months and re-renders                                       |
| `parseMoments(text)`      | Regex parser for YAML frontmatter + body blocks                                    |
| `computeMonthData()`      | Merges moments + incidents into month/day structure, precomputes cumulative totals |
| `buildHTML()`             | Generates full timeline HTML                                                       |
| `buildMomentHTML(moment)` | Renders a highlight card with image, title, body, links                            |
| `buildDayHTML(day)`       | Renders an incident day-cluster with category tags                                 |
| `initScrollObserver()`    | Sets up scroll-based totals bar updates                                            |
| `initClickHandlers()`     | Handles clicks on moments, incidents, and inline links                             |
| `findIncident(slug)`      | Looks up incident data by slug for image loading                                   |
| `renderLinks(text)`       | Converts markdown `[text](url)` to HTML links                                      |

**Depends On:** `App` (incident data), `Lightbox` (opening incidents)

### timeline.css (~500 lines)

Organized into clearly labeled sections:

| Section           | Purpose                                    |
| :-----------------| :------------------------------------------|
| Totals Bar        | Sticky header with running category counts |
| Content Area      | Main timeline column with vertical line    |
| Year Headers      | Year dividers                              |
| Month Sections    | Month labels                               |
| Narrative Moments | Highlight card styling                     |
| Day Clusters      | Incident dot groups                        |
| Desktop Layout    | `@media (min-width: 768px)` adjustments    |
| Large Desktop     | `@media (min-width: 1200px)` adjustments   |
| Narrow Mobile     | `@media (max-width: 480px)` adjustments    |
