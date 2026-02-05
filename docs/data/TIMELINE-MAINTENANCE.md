# Timeline Moments Maintenance Guide

This file explains how to maintain `timeline-moments.md`, the configuration file that drives the narrative layer of the `/timeline` view.

## How It Works

The timeline view combines two data sources:

1. **Incident data** (automatic) — Every incident markdown file in `docs/incidents/` is loaded by the app and displayed as a day-cluster on the timeline. These require no manual maintenance for the timeline.

2. **Narrative moments** (manual, this file) — `timeline-moments.md` defines the major events, policy actions, and turning points that provide context between the day-to-day incidents. These are the large cards with descriptions that appear on the timeline.

All incidents appear on the timeline automatically. The moments file only controls the narrative highlights.

## File Format

Each moment is a YAML-frontmatter block followed by a body paragraph, separated by blank lines:

```markdown
---
date: 2026-01-07
title: Renee Good Killed by ICE Agent
incident: 2026-01-07-renee-good-shooting
source:
---
Renee Nicole Macklin Good, 37, a writer, poet, and mother of three, is fatally shot by ICE agent Jonathan Ross while in her car in south Minneapolis. Her death becomes a catalyst for massive protests and legal action.
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `date` | Yes | `YYYY-MM-DD` format. Determines placement on timeline. |
| `title` | Yes | Short headline for the moment card. |
| `incident` | No | Slug of a linked incident file (e.g. `2026-01-07-renee-good-shooting`). Makes the card clickable — opens the incident detail. Leave empty if no incident file exists. |
| `source` | No | URL to a news article or primary source. Only displayed when there is NO linked incident (since incidents have their own sources). Used for policy events, announcements, etc. |
| `image` | No | Path to a custom image (e.g. `/media/custom/photo.jpg`). If omitted, the system automatically uses the OG image or primary media from the linked incident. Set to `false` to suppress images entirely. |

### Rules

- **`incident` takes priority over `source`** — If a moment has an `incident` slug, the card links to that incident and the `source` URL is not shown (the incident itself has sources).
- **`source` is for non-incident moments** — Policy announcements, troop deployments, court rulings that don't have their own incident file.
- **Images are automatic for incidents** — The system checks for `localMediaOgPath` first, then `localMediaPath`. Only set `image` if you want to override or suppress.
- **Moments appear in date order** — They are interleaved with incident day-clusters by date.
- **Two moments can share a date** — They will both appear on that date in the order they appear in the file.

## What to Add as a Moment

Focus on events that provide essential context for understanding the timeline:

### Good candidates:
- Fatal shootings or major uses of force
- Significant policy actions (troop deployments, executive orders, drawdowns)
- Major legal actions (lawsuits filed, court orders, contempt findings)
- Iconic incidents that became national news (citizen checks, children detained)
- Major community responses (50K march, general strike)
- Start/end of enforcement phases

### Not good candidates:
- Individual vigils or small protests (unless historically significant)
- Routine arrests without distinguishing factors
- Celebrity involvement unless it directly affected enforcement
- Events that duplicate what an incident file already covers without adding context

## Adding a New Moment

1. Find the right chronological position in the file
2. Add a blank line, then the `---` frontmatter block
3. If it links to an incident, use the incident filename (without `.md`) as the `incident` value
4. If it's a standalone event (no incident file), add a `source` URL
5. Write 1-3 sentences of description as the body — focus on what happened and why it matters
6. The description should read as narrative prose, not a headline

## Example: Adding a Court Ruling

```markdown
---
date: 2026-01-28
title: Judge Finds 96 Court Orders Violated
incident:
source: https://www.npr.org/2026/01/31/nx-s1-5693175/judge-says-immigration-and-customs-enforcement-has-violated-96-court-orders-this-month-in-minn
---
Minnesota Chief Judge Patrick Schiltz finds ICE has violated 96 court orders in January 2026 alone, stating ICE likely violated more orders in one month "than some federal agencies have violated in their entire existence."
```

## Example: Adding an Incident-Linked Moment

```markdown
---
date: 2026-01-20
title: 5-Year-Old Liam Ramos Detained
incident: 2026-01-20-liam-ramos-detained
source:
---
Five-year-old kindergartner Liam Conejo Ramos and his father Adrian are detained by ICE in a Minneapolis suburb. They are flown to the Dilley, Texas detention facility, drawing national outrage.
```

## Daily Maintenance Workflow

When updating the timeline:

1. Check for new major developments (shootings, court orders, policy changes, significant detentions)
2. Determine if the event warrants a narrative moment or is just a regular incident
3. If it's a regular incident, just add the incident file — it will appear on the timeline automatically
4. If it's a narrative moment, add it to this file following the format above
5. Run the dev server and check `/timeline` to verify placement and rendering

## Technical Notes

- The file is parsed by `docs/js/timeline.js` using regex on the `---` frontmatter blocks
- The parser extracts: `date`, `title`, `incident`, `source`, `image`, and the body text
- Moments are merged with incident data by date, then grouped into months
- Running totals in the sticky bar count only incident categories (citizens, observers, immigrants, schools-hospitals) — moments themselves are not counted
- Response-type incidents appear in the timeline with a "RESPONSE:" tag but are not counted in the totals bar
