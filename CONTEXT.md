# CONTEXT.md

This file is a **table of contents** for the project. It tells you WHERE to find detailed information, and contains critical rules that always apply.

## How This Works

1. **Read `~/.context.md` first** - Global coding preferences for all projects
2. **Read the Critical Rules below** - These apply to almost every task
3. **Scan the Quick Reference** to find which dev-docs to read for your task
4. **Read those specific dev-docs** before making changes

**The dev-docs are the source of truth for detailed procedures.** This file contains only rules that are critical enough to never miss.

---

## Project Overview

**MN ICE Files** documents civil rights incidents involving ICE/CBP in Minnesota during Operation Metro Surge (Dec 2025 - present). Mobile-first static site hosted on Cloudflare Pages.

---

## Critical Rules - Always Apply

These rules apply to almost every task. Do not skip them.

### Abbreviations
- **sm** = social media (see `dev-docs/social-media-listing-procedure.md`)

### Clean Up Test Files
**Delete test files when done.** Any temporary test files (screenshots, test images, scratch files) created during development must be removed before committing. Don't leave `*-test.*` or other temp files in the repo.

### Browser Testing
**Do NOT use Playwright** for browser testing unless explicitly asked. The user will test manually.

### Terminology
**"Entry" and "Incident" are synonyms.** The codebase uses both interchangeably. URLs use `/entry/`, code and docs say "incident" - they mean the same thing.

### Media in raw_media — MANDATORY SCRIPT USAGE
**NEVER manually rename or move files in `raw_media/`.** Use the scripts.

**When you see "latest screenshot/photo/mov in raw_media is for [INCIDENT]"** (from user OR command output):
```bash
# Step 1: Move and rename (uses newest file automatically)
./scripts/move-screen-recording.sh --type mov|png INCIDENT_ID

# Step 2: Process media (compress, generate OG images)
python-main scripts/process_media.py

# Step 3: Regenerate incidents summary
python-main scripts/generate_summary.py

# Step 4: Clean up any remaining Screen files
rm raw_media/Screen* 2>/dev/null
```

**DO NOT** use `mv`, `cp`, or manual file operations on raw_media. The script handles folder structure, naming conventions, and cleanup. See `dev-docs/screen-recording-workflow.md` for details.

### Timestamps — MANDATORY SCRIPT USAGE
**NEVER type a timestamp manually.** Manually-entered timestamps are frequently wrong.

**⚠️ REQUIRED WORKFLOW — Every time you set `created` or `last_updated`:**
```bash
./bin/timestamp.sh   # Run this FIRST, then copy-paste the output
```

This is not optional. Do not type `2026-01-22T12:00:00` or any other time from memory. Run the script, copy its output, paste it into the field. Every single time.

**NEVER backdate timestamps** — Even when adding an old incident from months ago, `last_updated` must be TODAY. It tracks when WE updated the site, not when the story had news coverage.

### Auto-Generated Files — NEVER Edit Directly
**The pre-commit hook runs `scripts/generate_summary.py` on every commit.** It regenerates and stages ALL of the following files automatically. NEVER edit them by hand — they will be overwritten.

**Category JSON files** (incident data for frontend):
- `docs/data/incidents-summary-citizens.json`
- `docs/data/incidents-summary-immigrants.json`
- `docs/data/incidents-summary-observers.json`
- `docs/data/incidents-summary-schools-hospitals.json`
- `docs/data/incidents-summary-response.json`
- `docs/data/incidents-summary-background.json`

**Search & SEO files:**
- `docs/data/search-index.md` — LLM search index with CURRENT/NO-ADD/REMOVED/CORRECTIONS/NO-NEWS-MEDIA sections
- `docs/sitemap.xml` — XML sitemap with all incident URLs

**Running data files** (new entries auto-appended):
- `docs/data/media-order.md` — new media slugs appended automatically (ordering is manual)

**Other pre-commit updates** (not from generate_summary.py):
- `docs/index.html` — cache bust `?v=` params updated with current timestamp
- `docs/about.md` — "Last updated" date updated to today

**To update incident data:** edit the markdown files in `docs/incidents/`, then commit. The hook handles the rest.

### Search Index for Daily Searches
**Read `docs/data/search-index.md` FIRST when searching for incidents.** It's auto-generated with 4 sections:

| Section | Contents |
|---------|----------|
| **CURRENT** | Published incidents with full file paths |
| **NO-ADD** | Rejected stories (auto-parsed from not_use.md) |
| **REMOVED** | Retracted incidents |
| **NO-NEWS-MEDIA** | Unverified incidents |

Format: `path | date | city | category | title`. One file replaces reading multiple sources.

### Trustworthiness Ratings
**Use exactly ONE of these four values:**
- `high`
- `medium`
- `low`
- `no-news-media`
- `corrected`

**NO compound values** like "medium-high" or "low-medium". Pick one.

### Incident Types (Categories)
**Exactly 6 types exist — these are the ONLY categories shown in UI:**
- `citizens` - U.S. citizens **OR anyone with valid legal status** (green cards, work visas, work permits, refugees with authorization)
- `observers` - People targeted for filming/observing/protesting ICE
- `immigrants` - People **without legal status** (undocumented, pending asylum, removal orders)
- `schools-hospitals` - Actions at/near schools or hospitals — **includes ICE presence that intimidates or disrupts, even without arrest**
- `response` - DHS/ICE official statements
- `background` - Contextual/background events (marches, lawsuits, policy changes, deployments)

**⚠️ CRITICAL: citizens vs immigrants distinction:**
| `citizens` | Has legal right to be here | US citizens, green card, valid work visa/permit, authorized refugees |
| `immigrants` | Does NOT have legal status | Undocumented, asylum pending, removal orders, overstayed visas |

**Simple test:** Does the person have VALID LEGAL STATUS? YES → `citizens`. NO → `immigrants`.

Multiple types allowed via comma: `type: citizens, schools-hospitals`

**Note:** `affected_individual_citizenship` (us-citizen, legal-resident, asylum-seeker, undocumented) is metadata, NOT a category.

### No-News-Media Incidents
Incidents with `trustworthiness: no-news-media` are **hidden from the main page** (both media gallery and list view). They appear only at `/no-news-media`, sorted by update date.

### Bullet List Punctuation
**Complete sentences get periods. Fragments don't.**

| Bullet Type | Period? | Example |
|-------------|---------|---------|
| Complete sentence | ✅ Yes | `- Agents broke the car window and extracted him.` |
| Metadata/fragment | ❌ No | `- **Name:** Jose Lozano` |
| Fragment phrase | ❌ No | `- Released same day` |

**Simple test:** Can it stand alone as a sentence? If yes, add a period. If it's a label or fragment, no period needed.

### SVG Icons
**NEVER inline SVG paths.** Always use the symbol/use pattern:

```html
<!-- WRONG -->
<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>

<!-- RIGHT -->
<svg width="16" height="16"><use href="#icon-play"/></svg>
```

Icons are defined in `docs/index.html`. See `dev-docs/ui-patterns.md` for the full list.

### Sources Must Have Links
**No link = not a source.** Every source in an incident file must link to a specific page about that incident. General homepages or profile pages don't count.

### No Circular Links
**Never link to the same page.** Links in Updates or elsewhere must point to external sources, not internal anchors on the same page (e.g., `#family-statement`). If you can't find an external source, **ask the user** to provide one rather than creating a self-referential link.

### Neutral Language
Use documentary tone. Let facts speak for themselves.

| Avoid | Use Instead |
|-------|-------------|
| raid, ransack | search |
| storm, invade | enter |
| kidnapped, snatched | detained, arrested |
| terrorize, brutalize | use force on |
| horrific, shocking | (describe facts instead) |
| exclusive, breaking | (omit) |

### Daily Search Command
When user says **"do our daily search"**, **ASK FIRST:**
1. **Time scope:** "Last 2 days, or broaden to catch missed incidents?"
2. **Geographic scope:** "Metro, outstate, or all MN?"

Then follow `dev-docs/daily-search-procedure.md`:
1. Read `docs/data/search-index.md` (has CURRENT, NO-ADD, REMOVED, NO-NEWS-MEDIA)
2. Launch 4-6 parallel search agents
3. Cross-reference findings against existing files
4. **Present results in 3 interactive rounds** (see below)

**Search scope commands:**
- **"do our daily search"** / **"do a metro search"** = Twin Cities sources only
- **"do an outstate search"** = Greater MN: Rochester, Duluth, Mankato, St. Cloud, Moorhead, Brainerd
- **"do a full search"** = Both metro + outstate

**Output — 3 rounds, never dump everything at once:**
1. **Round 1: New incidents — ONE AT A TIME.** Present each new incident individually, wait for user response (add / skip / not_use / need more info) before showing the next
2. **Round 2: Updates — ALL AT ONCE.** After all new incidents reviewed, present status changes, updates to existing incidents, and new sources together
3. **Round 3: Other items — ALL AT ONCE.** No-adds, already-documented confirmations, needs-more-research

### Timeline Review Command
When user says **"review the timeline"** or **"check the timeline"**:

1. Read the monthly moment files (`docs/data/timeline-moments-*.md`) for existing highlight moments
2. Read `docs/data/search-index.md` (all published incidents)
3. Compare incidents against moments — look for missing turning points, chronological gaps, and under-represented patterns
4. Follow the full procedure in `dev-docs/timeline.md` → "Reviewing the Timeline"

**Note:** Regular incidents appear on the timeline automatically. Only the curated highlight moment cards need manual review.

### When User Provides a Link to Add
**⚠️ CRITICAL:** Do NOT just use the source the user gave you. **Always search for additional coverage first.**

1. Read the provided source to extract key details (names, location, date)
2. Run 2-3 parallel web searches for more coverage
3. Check major outlets: NYT, WaPo, NBC, CBS, ABC, PBS, AP, local TV
4. Create the incident file with ALL discovered sources

**The user expects you to do the research**, not just copy what they gave you. See `adding-incidents.md` Step 1.5.

### When You Can't Fetch a URL
**Print the URL and ask for text.** When WebFetch fails or returns login walls/CSS:
1. Print the full URL
2. Ask: "Please paste the text so I can verify it covers this incident."
3. Do this one URL at a time — don't dump a list of URLs

**⚠️ "Sibling tool call errored":** When parallel WebFetch calls fail with this error, it means one failure cascaded to the others. **STOP immediately** — do not retry or launch more fetches. Ask the user for content of the failed URLs one at a time.

### Before Adding Any Incident
Read `adding-incidents.md` first. Check `not_use.md` for rejected stories.

### last_updated Field
**⚠️ CRITICAL RULE:** Only update `last_updated` when you are ALSO adding a `## Updates` entry. They must stay in sync.

**The test:** If you're not adding an `## Updates` entry at the top of the file, DON'T touch `last_updated`.

| Change | Update `last_updated`? | Why |
|--------|----------------------|-----|
| ✅ Court ruling, release, new facts | YES + add `## Updates` entry | Story development readers care about |
| ❌ Adding sources | NO | Just documentation, not story change |
| ❌ Formatting/schema fixes | NO | Internal maintenance |
| ❌ Trustworthiness rating change | NO | Editorial judgment |
| ❌ Adding U.S. citizen details to existing incident | NO (unless adding Updates entry) | Enrichment, not new development |

### Updates Section Placement
**The `## Updates` section goes RIGHT AFTER THE TITLE, BEFORE SUMMARY** — never at the bottom. This is user-facing content readers see first. Hyperlink to the source, end with a period:
```markdown
# Incident Title

## Updates
- **Jan 22** - [KSTP investigation](URL) reveals new facts about the case.

## Summary
```

---

## Quick Reference: What Doc to Read

| If you're doing... | Read these dev-docs |
|-------------------|---------------------|
| **"Do our daily search"** | `daily-search-procedure.md` (has exact steps), `not_use.md` |
| **User provides a link to add** | `adding-incidents.md` Step 1.5 (always search for more sources first) |
| **Adding a new incident** | `adding-incidents.md`, `incident-schema.md`, `not_use.md` |
| **Renaming an incident ID** | `id-reassignment.md` |
| **Hiding/drafting an incident** | `hiding-incidents.md` |
| **Searching for new incidents** | `daily-search-procedure.md`, `research-sources.md`, `not_use.md` |
| **Assessing source credibility** | `source-tiers.md`, `adding-incidents.md` |
| **Handling no-news-media incidents** | `no-news-media-incidents.md` |
| **Removing incidents (retracted)** | `removed-incidents.md` |
| **Correcting incidents (factual errors)** | `corrected-incidents.md` |
| **Status/citizenship values** | `status-categories.md` |
| **Modifying JavaScript** | `architecture.md` (JS module reference) |
| **Modifying CSS** | `architecture.md` (CSS structure section) |
| **URL/routing work** | `navigation.md` |
| **Video player/media** | `media-playback.md` |
| **Timeline highlights / moments** | `timeline.md` |
| **"Review the timeline"** | `timeline.md` (review procedure) |
| **Adding icons or UI elements** | `ui-patterns.md` |
| **Processing media files** | `architecture.md` (media pipeline), `adding-video-audio.md` |
| **"Latest screenshot/mov is for..."** | `screen-recording-workflow.md` (3-step pipeline: move script → process_media → generate_summary) |
| **Testing on preview branch** | `preview-deployments.md` |
| **Understanding deployment** | `DEPLOYMENT.md` |
| **Cloudflare settings/CDN** | `cloudflare-configuration.md` |
| **Firewall blocking issues** | `firewall-strategy.md` |
| **Analytics/tracking** | `analytics.md` |
| **Refactoring code** | `architecture.md` (JS module reference) |
| **Social media posts** | `social-media-listing-procedure.md` |
| **Official DHS responses** | `researching-responses.md` |
| **Scaling concerns** | `scaling-strategy.md` |
| **Notable incidents feature** | `notable-incidents.md` |
| **Operation PARRIS context** | `operation-parris.md` |
| **Contact info** | `contacts.md` |
| **OG image (social sharing)** | `og-image.md`, `custom-og-images.md` |
| **Logo/favicon management** | `logo-management.md` |

---

## Code Structure

```
GIT_MN_ICE_FILES/
├── CONTEXT.md           # This file (TOC + critical rules)
├── dev-docs/            # ALL detailed documentation
├── bin/
│   ├── run-server.sh    # Local dev server (uses wrangler)
│   └── timestamp.sh     # Get current timestamp
├── scripts/
│   ├── generate_summary.py   # Auto-gen: 6 category JSONs, search-index.md, sitemap.xml, media-order.md
│   ├── generate_og_image.py  # Creates og-image.jpg collage
│   └── process_media.py      # Compresses raw_media → docs/media
├── functions/           # Cloudflare Functions for path URLs
├── raw_media/           # Source video/images (NEVER modified)
└── docs/                # Website content (deployed to Cloudflare)
    ├── index.html       # (auto: cache bust ?v= params on commit)
    ├── sitemap.xml      # (auto-generated, never edit)
    ├── about.md         # (auto: "Last updated" date on commit)
    ├── css/
    │   ├── style.css    # Main styles
    │   └── timeline.css # Timeline-specific styles
    ├── js/              # See architecture.md for module details
    ├── incidents/       # ALL incident markdown files
    │   ├── 2025-12/     # Month folders contain day subfolders
    │   │   ├── 02/      # Day subfolders contain dated incidents
    │   │   └── ...
    │   └── 2026-01/
    │       ├── 07/
    │       └── ...
    ├── media/           # Processed video/images (also uses YYYY-MM/DD structure)
    └── data/
        ├── incidents-summary-*.json  # 6 category files (AUTO-GENERATED)
        ├── search-index.md           # LLM search index (AUTO-GENERATED)
        ├── media-order.md            # Gallery ordering (auto-appends new, manual reorder)
        ├── timeline-moments-*.md      # Curated timeline cards, per month (MANUALLY EDITED)
        ├── og-tweaks.md              # Custom OG image timestamps (MANUALLY EDITED)
        └── high-quality-videos.md    # Videos needing less compression (MANUALLY EDITED)
```

---

## Dev-Docs Index

### Core Documentation
| Doc | Contents |
|-----|----------|
| `architecture.md` | System design, JS module reference, CSS structure, Python scripts, media pipeline |
| `incident-schema.md` | Frontmatter schema, body structure, source formatting |
| `adding-incidents.md` | Step-by-step guide, duplicate checking, trustworthiness criteria |
| `hiding-incidents.md` | Temporarily hide drafts/unpublished incidents using underscore prefix |

### URL & Navigation
| Doc | Contents |
|-----|----------|
| `navigation.md` | Path URLs, hash URLs, Cloudflare Functions, local dev |
| `id-reassignment.md` | Renaming incident IDs with redirects |

### UI & Media
| Doc | Contents |
|-----|----------|
| `timeline.md` | Timeline feature: two-layer system (auto incidents + curated moments), moment format, review procedure |
| `ui-patterns.md` | SVG icon pattern, available icons |
| `media-playback.md` | Video controls, loading strategy, fullscreen |
| `adding-video-audio.md` | System audio capture
| `screen-recording-workflow.md` | Moving/renaming screen recordings, cleanup |
| `media-candidates.md` | Videos to research |
| `og-image.md` | Social sharing image generation |
| `custom-og-images.md` | Replace auto-generated OG images with custom screenshots |
| `logo-management.md` | Favicon/logo creation and switching |

### Research & Content
| Doc | Contents |
|-----|----------|
| `research-sources.md` | News sources, social accounts |
| `source-tiers.md` | Source credibility tiers (Tier 1/2/3) for trustworthiness ratings |
| `researching-responses.md` | Finding DHS/ICE responses |
| `daily-search-procedure.md` | Daily search workflow |
| `not_use.md` | Rejected stories |
| `no-news-media-incidents.md` | Procedure for handling no-news-media incidents |
| `removed-incidents.md` | Procedure for removing incidents after contradicting information emerges |
| `status-categories.md` | Citizenship status values and location formatting |
| `operation-parris.md` | Refugee detention context |
| `notable-incidents.md` | Notable flag feature |

### Operations & Deployment
| Doc | Contents |
|-----|----------|
| `DEPLOYMENT.md` | Cloudflare, DNS, deployment |
| `cloudflare-configuration.md` | Pro plan settings, CDN vs Stream, cost decisions |
| `firewall-strategy.md` | Corporate firewall blocking, URL categorization submissions |
| `preview-deployments.md` | Testing branches |
| `scaling-strategy.md` | Data metrics, thresholds |

### Social Media
| Doc | Contents |
|-----|----------|
| `contacts.md` | Official site URL, email, social media handles |
| `social-media-listing-procedure.md` | Daily posts |

### Reference
| Doc | Contents |
|-----|----------|
| `context-maintenance.md` | How to maintain this TOC system |
| `meta-not-use.md` | About page story exclusions |
| `analytics.md` | Analytics options, GA code preserved (currently disabled) |

---

## Development Commands

```bash
# Local dev server (includes Cloudflare Functions)
./bin/run-server.sh

# Simple server (no Functions)
./bin/run-server.sh --simple

# Process media files
python-main scripts/process_media.py

# Regenerate incidents JSON
python-main scripts/generate_summary.py

# Generate OG image from source folder
python-main scripts/generate_og_image.py docs/og-image

# Get current timestamp (ALWAYS use this)
./bin/timestamp.sh
```

---

## Maintaining This System

**When you create or significantly update a dev-doc:**

1. Check if CONTEXT.md's Quick Reference table needs updating
2. Check if the Dev-Docs Index needs a new entry or updated description
3. If the doc contains a rule that applies to many tasks, consider adding it to Critical Rules

**When asked to "reindex" or "update the TOC":**

Read `dev-docs/context-maintenance.md` for the full procedure.

**The goal:** Reading only CONTEXT.md should be enough to:
- Know all critical rules that apply to most tasks
- Know exactly which dev-doc to read for any specific task
- Never miss important rules because they're buried in detail
