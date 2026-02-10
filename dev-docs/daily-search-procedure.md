# Daily Search Procedure for Finding New Incidents

Step-by-step guide for searching for and documenting new ICE incidents.

---

## When User Says "Do Our Daily Search"

**CRITICAL: Always ask clarifying questions first.**

When the user initiates a daily search, ASK before proceeding:

1. **Time scope:** "Should I focus on the last 2 days, or broaden the search to catch missed incidents?"
2. **Geographic scope:** "All of MN, metro only, or outstate only?"

**Default if user says "just go":** Last 2 days, metro focus.

---

## Search Priorities (In This Order)

**Present results in this order — don't mix them:**

### Priority 1: NEW INCIDENTS (Present First)
The primary goal of daily searches. Look for stories we haven't documented yet.

### Priority 2: STATUS CHANGES (Present After New Incidents Added)
- **Upgrading no-news-media → real incident:** Found legitimate news coverage for a previously unverified story
- **Upgrading no-add → real incident:** New information changes the assessment
- **Removing an incident:** Very rare — only when contradicting information emerges (see `removed-incidents.md`)

### Priority 3: UPDATES TO EXISTING INCIDENTS (Present Last)
- New developments (court rulings, releases, new facts)
- These require adding `## Updates` entry AND updating `last_updated`

### Priority 4: NEW SOURCES (Document Along the Way, Don't Announce)
- Additional coverage for existing incidents
- Add these quietly to incident files — no need to report unless they contain new information
- Do NOT update `last_updated` for new sources alone

**Workflow:** Present new incidents ONE AT A TIME interactively. After all are reviewed, present all updates at once. Then present all other items (no-adds, etc.) at once.

---

## Awareness of Existing Incidents

**Before searching, you MUST know what already exists.** This prevents:
- Adding duplicate incidents
- Proposing stories already in not_use.md
- Missing opportunities to upgrade no-news-media incidents

**Read `docs/data/search-index.md` FIRST** — it has 4 sections:
| Section | What It Contains |
|---------|------------------|
| **CURRENT** | Published incidents (won't add these again) |
| **NO-ADD** | Rejected stories (don't propose unless new info) |
| **REMOVED** | Retracted incidents (acknowledge if found) |
| **NO-NEWS-MEDIA** | Unverified incidents that may upgrade with news coverage |

---

## Ad-Hoc Incident Additions (User Provides a Link)

**⚠️ CRITICAL:** When a user provides a news link and asks you to add an incident, **DO NOT just use that one source.** Always search for additional coverage first.

**Procedure:**
1. Read the provided source to extract key details (names, location, date)
2. Run 2-3 parallel web searches for additional coverage
3. Check major outlets: NYT, WaPo, NBC, CBS, ABC, PBS, AP, local TV
4. Create the incident file with ALL discovered sources

**Why:** Major stories typically have 5-10+ sources. A single-source incident file looks poorly researched. The user expects you to find comprehensive coverage, not just use what they gave you.

**Example:**
- User provides: 1 NYT link about judge ordering ICE director to court
- You should find: NBC, WaPo, CBS, ABC, PBS, local coverage = 8+ sources
- Then create the incident with all sources

See `adding-incidents.md` Step 1.5 for full details.

---

## Search Scope Commands

The user may request different search scopes:

| Command | Scope | Sources to Search |
|---------|-------|-------------------|
| **"do our daily search"** | Metro (default) | Twin Cities sources: BMTN, Star Tribune, MPR, KARE 11, KSTP, Fox 9, Sahan Journal |
| **"do a metro search"** | Metro only | Same as above |
| **"do an outstate search"** | Outstate MN | Brainerd Dispatch, InForum (Fargo-Moorhead), WJON/St. Cloud Times, Duluth News Tribune/WDIO, Mankato Free Press/KEYC, Post Bulletin/KTTC (Rochester) |
| **"do a full search"** | Both | All metro + all outstate sources |

See `research-sources.md` for complete source lists by region.

---

## Daily Search Command (Metro)

When the user says **"do our daily search"** or **"do a metro search"**, follow this exact procedure:

### Phase 1: Gather Context (Before Searching)
1. **Read `docs/data/search-index.md`** - Comprehensive index with 4 sections:
   - **CURRENT** - Published incidents (path, date, city, category, title)
   - **NO-ADD** - Rejected stories (auto-parsed from not_use.md)
   - **REMOVED** - Retracted incidents
   - **NO-NEWS-MEDIA** - Unverified incidents that may upgrade

**Why search-index.md first?** It's auto-generated and contains ALL incident types plus rejected stories in one file. Format: `path | date | city | category | title`

**You no longer need to separately read not_use.md** - it's parsed into the NO-ADD section automatically.

### Phase 2: Launch Parallel Search Agents
Launch **4-6 agents simultaneously** with different search strategies:

| Agent | Focus Area | Search Terms |
|-------|------------|--------------|
| 1 | BMTN Daily Lists | `site:bringmethenews.com ICE Minnesota [today/yesterday dates]` |
| 2 | Local TV News | `KARE 11 OR KSTP OR Fox 9 OR CBS Minnesota ICE Minneapolis [dates]` |
| 3 | Sahan Journal + MPR | `site:sahanjournal.com OR site:mprnews.org ICE Minnesota January 2026` |
| 4 | Social Media | `site:x.com OR site:bsky.app ICE Minneapolis Minnesota [dates]` |
| 5 | Video Evidence | `ICE Minnesota video footage January 2026` |
| 6 | No-News-Media Follow-up | Search for specific no-news-media incident details (names, locations) |

### Phase 3: Cross-Reference and Report
Each agent should:
1. Cross-reference findings against existing `docs/incidents/` files
2. Cross-reference against `dev-docs/not_use.md`
3. **Remember but don't report yet:**
   - Updates to existing incidents (new sources, status changes)
   - No-news-media upgrades
4. **Report immediately:**
   - **New incidents found** (date, location, description, sources)
   - **Already documented** (incident matched existing file)
   - **Add to not_use.md** (evaluated and rejected, with reason)

### Phase 4: Interactive Output — ONE NEW INCIDENT AT A TIME

**Critical: Do NOT dump all results at once.** Present findings in three sequential rounds:

**Round 1: New Incidents — ONE AT A TIME (Interactive)**

For each new incident found, present it individually and wait for user response before moving to the next:

```markdown
## New Incident 1 of N

**Date:** Jan 30, 2026
**Location:** Rochester, MN
**Description:** Brief description of what happened
**Video/Photo?:** Yes/No
**Sources found:** [list URLs]
**Suggested category:** citizens / immigrants / observers / schools-hospitals

→ Should I add this? (add / skip / add to not_use / need more info)
```

After the user responds (add, skip, not_use, etc.), present the next new incident. Continue until all new incidents have been reviewed.

**Round 2: Updates to Existing Incidents — ALL AT ONCE**

After all new incidents are reviewed, present all updates together:

```markdown
## Updates Found

### Status Changes (no-add/no-news-media → real incident)
| Incident | Previous Status | New Status | Evidence |
|----------|-----------------|------------|----------|

### Updates to Existing Incidents (requires ## Updates entry)
| Incident | Update Type | Details |
|----------|-------------|---------|

### New Sources Added (no report needed, just document)
[Added to N incident files — no last_updated changes]
```

**Round 3: Other Items — ALL AT ONCE**

Finally, present all non-incident items together:

```markdown
## Other Items

### Added to not_use.md
| Story | Reason |
|-------|--------|

### Already Documented (confirmed coverage exists)
- List of stories that matched existing incidents

### Needs More Research
- Stories needing additional verification
```

### Phase 5: Rarely — Incident Removal
Very rarely, contradicting information may require removing an incident. See `removed-incidents.md` for procedure. Flag these for user review — never remove without confirmation.

---

---

## Outstate Search Command

When the user says **"do an outstate search"**, search for incidents in Greater Minnesota:

### Outstate Search Agents

Launch **4-6 agents simultaneously** targeting outstate cities:

| Agent | Region | Search Terms |
|-------|--------|--------------|
| 1 | Rochester | `site:postbulletin.com OR site:kttc.com ICE Rochester Minnesota [dates]` |
| 2 | Duluth | `site:duluthnewstribune.com OR site:wdio.com ICE Duluth Minnesota [dates]` |
| 3 | Mankato | `site:mankatofreepress.com OR site:keyc.com ICE Mankato Minnesota [dates]` |
| 4 | St. Cloud | `site:sctimes.com OR site:wjon.com ICE St. Cloud Minnesota [dates]` |
| 5 | Moorhead | `site:inforum.com OR site:kvrr.com ICE Moorhead Fargo Minnesota [dates]` |
| 6 | Brainerd | `site:brainerddispatch.com ICE Brainerd Minnesota [dates]` |

### Additional Outstate Searches

- General: `ICE Minnesota outstate rural January 2026`
- Meatpacking: `ICE Minnesota meatpacking plant [dates]` (common target)
- Agricultural: `ICE Minnesota farm agricultural worker [dates]`

---

## Daily/Recurring Search Mode

This procedure is designed to be run **1-2 times daily**. For efficient recurring searches:

1. **Ask about time scope** - Default is last 2 days, but user may request broader search for missed incidents
2. **Ask about geographic scope** - Metro, outstate, or full MN
3. **Check BMTN daily lists first** - Bring Me The News publishes daily roundup articles
4. **Use the Task tool with Explore agent** - Get comprehensive incident summary before searching
5. **Cross-reference quickly** - Many searches will confirm existing coverage; that's expected

### Time Scope Options
| Scope | When to Use | Search Dates |
|-------|-------------|--------------|
| **Last 2 days** (default) | Normal daily search | Yesterday + today |
| **Last week** | Catching up after break | Last 7 days |
| **Broader** | Looking for missed/rare incidents | User specifies range |

### Quick Start for Daily Searches
```
1. ASK: "Last 2 days? Metro, outstate, or all MN?"
2. Read search-index.md for existing incidents
3. Search BMTN for "List of major ICE raids" + [dates]
4. Run 4-5 parallel web searches for recent incidents
5. Cross-reference results against existing files
6. ROUND 1: Present new incidents ONE AT A TIME (wait for user on each)
7. ROUND 2: Present all updates at once
8. ROUND 3: Present all other items (no-adds, etc.) at once
```

## Before You Start

**⚠️ You must know what exists before searching. This prevents duplicates and wasted effort.**

1. **Ask clarifying questions** - Time scope (last 2 days or broader?) and geographic scope (metro/outstate/full?)
2. **Read `docs/data/search-index.md`** - Contains CURRENT, NO-ADD, REMOVED, and NO-NEWS-MEDIA in one file
3. **Note the current date** - Search results are time-sensitive
4. **Check recent git activity** - Use git diff to monitor changes (see below)

---

## When You Can't Fetch a URL

**The user can help.** When WebFetch fails or returns login walls/paywalls/403 errors:

1. **Print the URL** you're trying to access
2. **Ask:** "Can you paste the article text so I can extract the details?"
3. **Do this one URL at a time** — don't dump a list of URLs
4. **User will copy/paste** the article contents for you to parse

This is faster than trying multiple fetch workarounds. The user has browser access to most sources.

### Using Git Diff to Monitor Recent Changes

**This is critical for effective daily searches.** Recent additions to not_use.md and recently added incidents are the most important items to pay attention to because:
- They represent stories that are actively developing
- Items with "WATCH" status may need re-evaluation
- Recently documented incidents may have updates

**Commands to run:**

```bash
# See what files changed recently
git diff HEAD~5 --name-only

# See recent changes to not_use.md (important for WATCH items)
git diff HEAD~10 -- dev-docs/not_use.md

# See recently modified incident files
find docs/incidents/2026-01 -name "*.md" -type f -exec ls -lt {} + | head -20

# See content changes in not_use.md
git log --oneline -10 -- dev-docs/not_use.md
```

**What to look for:**
- **WATCH items in not_use.md** - Stories that may be upgraded to incidents if more information emerges
- **Recently added incidents** - May need additional sources or updates
- **Incidents with pending court cases** - Rulings may change status

## Search Strategy

### Step 1: Run Multiple Parallel Searches

Use web search tools to run these queries simultaneously:

```
ICE Minneapolis Minnesota [current month year] video evidence
ICE Minneapolis St Paul [current month year] physical abuse brutality
ICE Minnesota citizen detained wrongful arrest [current month year]
ICE raid Minnesota [recent dates]
```

### Step 2: Check Key Sources Directly

Search these specific sites:
- `"Bring Me The News" ICE Minnesota` - Best for daily raid lists
- `"Sahan Journal" ICE Minnesota` - Immigration-focused investigative coverage
- `"Star Tribune" ICE Minneapolis` - Local paper of record
- `"MPR News" ICE Minnesota` - Public radio, often first to report

### Step 3: Search for Video Evidence Specifically

Look for incidents with:
- Cell phone footage
- News station video
- Social media videos picked up by news
- Photo documentation

Priority searches:
```
ICE Minnesota video footage [month year]
ICE Minneapolis assault [month year] video
ProPublica ICE Minnesota [month year]
```

### Step 4: Check for Legal Actions/ACLU

Search for:
```
ACLU ICE Minnesota lawsuit [month year]
ICE Minnesota lawsuit citizen detained
```

### Step 5: Search Social Media Platforms

**CRITICAL:** Social media often has first-hand video evidence before news coverage.

#### X (Twitter)
```
site:x.com ICE Minnesota Minneapolis [month year]
site:twitter.com ICE Minneapolis [month year]
```

#### Bluesky
```
site:bsky.app ICE Minnesota Minneapolis [month year]
```

#### TikTok
```
site:tiktok.com ICE Minnesota Minneapolis [month year]
```

#### Instagram
```
site:instagram.com ICE Minnesota video [month year]
```

#### Threads
```
site:threads.net ICE Minnesota [month year]
```

#### Key Accounts to Monitor
- **@mnicewatch** (Instagram) - MN ICE Watch community tracking
- **@DHSgov** / **@ICEgov** (X) - Official DHS/ICE responses
- **Middle East Eye** (TikTok) - Often covers Minneapolis incidents
- Local reporter accounts on X

#### Important Notes on Social Media
- Social media posts alone are NOT sufficient for HIGH trustworthiness
- Look for videos that were later picked up by news outlets
- When you find a viral video, search for the affected individual's name or location to find news coverage
- If a social media post has video but no news pickup, add to "Needs More Research" and rate MEDIUM at best

### Step 6: Search the General Web

In addition to specific news sites, always search the general web for incidents:
```
"affected individual full name" ICE detained
"affected individual full name" Minnesota
incident location ICE arrest [date]
```

This catches coverage from smaller outlets, syndicated stories, and social media that may not appear in site-specific searches. If a story only appears in ONE source after general web searches, flag it as needing corroboration and rate trustworthiness as MEDIUM at best.

## Evaluating Search Results

### Cross-Reference Against Existing Files

For each potential incident found:

1. **Check by date** - Do we have `docs/incidents/YYYY-MM/DD/YYYY-MM-DD-*.md` for that date?
2. **Check by affected individual's name** - Grep for names in existing files
3. **Check by location** - Search for the street, business, or neighborhood
4. **Check not_use.md** - Is this story already evaluated and rejected?

```bash
# Example checks
grep -ri "person name" docs/incidents/
grep -ri "location" docs/incidents/
grep -i "story keywords" dev-docs/not_use.md
```

### Priority: Video/Photo Evidence

**Highest priority incidents** to document:
- Video showing physical abuse by ICE
- Video of unlawful arrest or detention
- Photo evidence of injuries
- Footage of citizens being stopped/harassed

These provide incontrovertible evidence and should be documented with HIGH trustworthiness if from multiple sources.

### What Qualifies as a New Incident

**DOCUMENT** if:
- U.S. citizen detained, arrested, or harmed
- Legal resident (green card, work visa, work permit) detained, arrested, or harmed
- U.S. citizen subjected to citizenship check (stopped, questioned)
- Bystander/observer arrested for filming or watching
- Non-criminal immigrants without legal status — business owners, workers, asylum seekers
- ICE activity at schools, hospitals, churches — **presence that intimidates or disrupts counts, even without arrest**
- Video/photo evidence of abuse

**DO NOT DOCUMENT** (add to not_use.md instead):
- Protest-only coverage without a civil rights incident
- Criminal investigations (drug trafficking, weapons)
- Detainees with criminal convictions
- Single social media posts without news coverage
- Rumors without any news pickup
- **Incidents where we can't determine the detained person's status** — If we don't know whether someone is a citizen, legal resident, or undocumented immigrant, we can't categorize the incident. Skip it unless more information emerges.
- **Incidents that lack minimum detail** — see Minimum Detail Standard below.

**Key principle:** Every incident must clearly fit into one of our categories (citizens, immigrants, observers, schools-hospitals, response). If you can't determine the category, don't add it.

### Minimum Detail Standard

**An incident needs more than just "someone was detained at [location]."** Reports that only provide a location and the fact of an arrest — with no name, no age, no immigration status, and no independent news coverage — are insufficient for documentation.

At minimum, an incident must have **at least two** of the following:
1. **Name** of the affected individual (even first name only)
2. **Age or identifying details** (occupation, family situation, school)
3. **Immigration/citizenship status** (citizen, legal resident, undocumented, asylum-seeker)
4. **Independent news coverage** beyond community observer reports (news outlet with original reporting)
5. **Video or photo evidence** of the incident

**Why this matters:** Community observer networks like People Over Papers log dozens of ICE sightings and arrests daily via BMTN roundups. These are valuable for tracking ICE activity patterns but typically contain only "[location] — [someone detained]" with no further detail. These go straight to not_use.md with reason "Insufficient details" unless they later get independent news coverage or more identifying information emerges.

**Example of what fails the standard:** "Report of someone detained at an ATM in Albert Lea" (People Over Papers via BMTN) — no name, no age, no status, no independent coverage. → not_use.md

**Example of what passes:** "Kevin, a restaurant worker at Pancho's Taqueria in Circle Pines with a valid work visa, detained by plainclothes agents; surveillance video captured arrest; employer confirmed legal status" — named individual, status confirmed, video evidence, multiple news outlets. → document as incident

**PROMOTING from not_use.md:** If new information upgrades a rejected story into a valid incident, create the incident file and **remove the entry from not_use.md entirely**. Don't mark it or leave a stub — the incident file is the record.

### Categorizing Incidents: citizens vs immigrants

**⚠️ CRITICAL DISTINCTION — Get this right when creating incident files:**

| Category | Who belongs here | Examples |
|----------|------------------|----------|
| `citizens` | **Has legal right to be in U.S.** | U.S. citizens, green card holders, valid work visa/permit holders, refugees with work authorization |
| `immigrants` | **Does NOT have legal status** | Undocumented, asylum-seekers awaiting decision, people with removal orders, overstayed visas |

**Simple test:** Does the person have VALID LEGAL STATUS?
- **YES** → `type: citizens` (even if they're not a U.S. citizen)
- **NO** → `type: immigrants`

**Common mistakes to avoid:**
- ❌ Legal resident with valid visa → DON'T put in `immigrants`
- ❌ Asylum seeker with pending case (no work authorization) → DON'T put in `citizens`
- ❌ H-2A temporary agricultural workers → These are `citizens` (valid work visa)
- ❌ Person with final removal order → This is `immigrants` (no longer has legal status)

**When in doubt:** Search for the person's immigration status in the sources. If a source says "valid visa," "green card," "legal resident," "work permit" → `citizens`. If it says "undocumented," "removal order," "pending asylum," "overstayed" → `immigrants`.

## Output Format

After completing search, report:

### New Incidents Found
| Date | Location | Brief Description | Video/Photo? | Sources |
|------|----------|-------------------|--------------|---------|

### Already Documented
List incidents found that match existing files

### Promoted from not_use.md
List any stories previously in not_use.md that are now being added as incidents (remove these entries from not_use.md)

### Added to not_use.md
List stories evaluated and rejected, with reasons

### Needs More Research
List incidents that need additional verification before documenting

## Tips for Effective Searches

1. **Search by date ranges** - "January 15 16 2026" finds recent activity
2. **Use quotes for exact phrases** - "Bring Me The News" ensures that site
3. **Check list articles** - Sites like BMTN often publish "List of major ICE raids on [date]"
4. **Follow up on vague mentions** - If a search mentions an incident briefly, search specifically for it
5. **Look for updates** - Existing incidents may have new information (updated video, affected individual spoke out, lawsuit filed)

## After Searching

1. **Report findings to user** - Summarize what was found
2. **Propose new incident files** - If any qualify, outline what would be documented
3. **Update not_use.md** - Add any evaluated/rejected stories
4. **Update existing incidents** - If new information found for existing files
5. **Add ALL discovered sources** - Even preliminary links should be added to incident files

### Updating Incident Content When New Information Emerges

When new sources contain significant new information (court rulings, releases, new charges, affected individual statements), update the incident file accordingly:

1. **Update the Summary** - Reflect major developments (e.g., judge's ruling, release, new charges)
2. **Update Status** - Change `ongoing` to `resolved` if case concluded
3. **Update Timeline** - Add new dated events
4. **Update `last_updated`** - **ONLY for substantive story changes** (see below)

Example: If a judge rules an arrest was unconstitutional, update the summary to mention the ruling, not just add the source.

### When to Update `last_updated` (Critical!)

**This field powers the "Sort by Updated" feature on the website.** Users who sort by "Updated" want to see incidents where something actually happened, not incidents that got more sources added.

| Action | Update `last_updated`? |
|--------|------------------------|
| Judge ruling / court decision | ✅ YES |
| Person released or deported | ✅ YES |
| Status change (ongoing → resolved) | ✅ YES |
| New facts emerge (identity confirmed, details) | ✅ YES |
| Lawsuit filed | ✅ YES |
| **Adding more news sources** | ❌ NO |
| **Adding video/photo links** | ❌ NO |
| **Trustworthiness rating change** | ❌ NO |
| **Formatting/typo fixes** | ❌ NO |

**Example:** You find 3 new news articles about the Garrison Gibson incident. Just add them to Sources — do NOT update `last_updated`. But if one of those articles says the judge released him, THEN update `last_updated` and the Summary.

### Adding Sources to Existing Incidents

**CRITICAL:** When researching, add ALL discovered sources to incident files, even without news coverage:

- Add new sources to the END of the Sources section (don't reorder existing sources)
- Include social media links (X, TikTok, Instagram, Threads, BlueSky, Facebook)
- Include international coverage (UK, Canadian, Australian outlets)
- Include commentary/opinion pieces that reference the incident

Example format for adding sources:
```markdown
## Sources
1. [Existing source 1](url)
2. [Existing source 2](url)
...existing sources...
15. X - @username (Month Year): [Post description](url)
16. TikTok - @account (Month Year): [Video description](url)
17. Instagram Reel (Month Year): [Description](url)
18. Threads - @account (Month Year): [Post description](url)
```

This ensures:
- Complete documentation of all coverage
- Preservation of the historical record

## Key BMTN Daily List URLs

Bring Me The News publishes daily roundup articles with predictable URL patterns:

```
bringmethenews.com/minnesota-news/list-of-major-ice-raids-updates-in-minnesota-on-[day]-jan-[date]
bringmethenews.com/minnesota-news/list-of-ice-raids-protest-updates-in-minnesota-on-[day]-jan-[date]
```

Example searches:
```
site:bringmethenews.com ICE January 17 2026
"Bring Me The News" list ICE raids January 17
```

These daily lists often contain brief mentions of incidents that may warrant their own file. Always check these first for recurring searches.

## Efficiency Tips for Recurring Searches

1. **Run parallel web searches** - Use 4-5 WebSearch calls in a single message for speed
2. **Grep before creating** - Before creating a new incident, grep for affected individual's name/location
3. **Update existing files generously** - Adding sources to existing incidents is valuable work
4. **Track what you've checked** - Report "Already documented" and "In not_use.md" findings
5. **Date-specific searches** - Include specific dates (e.g., "January 16 17 2026") in queries
6. **Note unclear incidents** - Add borderline cases to not_use.md with "may revisit" notes

## High-Value Sources for New Incidents

| Source | Best For | Check Frequency |
|--------|----------|-----------------|
| Bring Me The News | Daily raid lists, quick updates | Every search |
| Sahan Journal | In-depth investigative, immigrant communities | Daily |
| Star Tribune | Paper of record, official statements | Daily |
| MPR News | Breaking news, audio interviews | Daily |
| ICT News | Native American incidents | When relevant |
| ACLU Minnesota | Legal actions, civil rights cases | Weekly |
| CBS Minnesota / KSTP / KARE 11 | Video evidence, local TV coverage | As needed |

## Example Search Session Log

```
Date: 2026-01-17
Searches run:
- ICE Minneapolis January 2026 video evidence ✓
- ICE Minnesota citizen detained January 2026 ✓
- site:bringmethenews.com ICE January 16 17 2026 ✓
- ACLU Minnesota ICE lawsuit January 2026 ✓
- MPR News ICE Minnesota January 16 17 ✓

New incidents found:
- NewsGuild union member detained (Jan 16) - ADDED

Already documented (confirmed good coverage):
- Aliya Rahman (2026-01-13) ✓
- Garrison Gibson (2026-01-12) ✓ - added new sources
- Oglala Sioux detained (2026-01-14) ✓ - added new sources
- El Tapatio Willmar (2026-01-15) ✓

Added to not_use.md:
- Burnsville Salvation Army (Jan 16) - insufficient details
- New Hope apartment ICE presence - no specific affected individuals
- Far-right counter-protest - protest only, no enforcement incident

In not_use.md (already excluded):
- North Minneapolis shooting (Sosa-Celis) - excluded

Needs verification:
- None this session
```
