# Adding New Incidents

Step-by-step guide for adding new incidents to the site.

## Step 0: Check for Duplicates and Not-Use List

**BEFORE adding a new incident**, perform these checks:

### A. Check Not-Use List
Check `dev-docs/not_use.md` to see if the story was already evaluated and rejected. This prevents re-adding stories that don't fit the project scope.

**If a not_use story later becomes an incident:** Remove the entry from `not_use.md` entirely. Don't mark it or leave a stub — the incident file itself is the record. The search index will pick it up in the CURRENT section on next commit.

### B. Check for Existing Incident Files
Search existing incident files in `docs/incidents/` to ensure the incident isn't already documented:

1. **Search by location** - Same address, intersection, or business name
2. **Search by date** - Same day, even if different details emerged
3. **Search by affected individual's name** - If known
4. **Search by keywords** - Key phrases from the incident

```bash
# Example searches
grep -r "Circle Pines" docs/incidents/
grep -r "2026-01-14" docs/incidents/
grep -r "bus stop" docs/incidents/
```

### C. If You Find a Potential Duplicate
**Do NOT create a new file.** Instead:

1. Open the existing incident file
2. Add new sources to the Sources section
3. Add new details to relevant sections (Timeline, Affected Individual info, etc.)
4. Update `last_updated` in frontmatter
5. Update Editorial Assessment if trustworthiness improves

This keeps all information about an incident in one place and prevents fragmentation.

### D. Similar Stories Are NOT Always the Same Incident

**IMPORTANT:** Do NOT combine separate incidents just because they seem related or similar. Create separate incident files when:

| Scenario | Action |
|----------|--------|
| Different dates | Separate incidents |
| Different people involved (even if same location/topic) | Separate incidents |
| Different actions (e.g., attorneys denied access vs. lawmakers denied access) | Separate incidents |
| Same underlying issue but distinct events | Separate incidents |
| Same event with new sources/details | Merge into existing incident |
| Same event covered by different outlets | Merge into existing incident |

**Example of what NOT to do:**
- "Attorneys denied access to detainees" (Jan 15-18) and "Congressional lawmakers denied access to facility" (Jan 10) are **two separate incidents**, even though both involve access denial at the same building. They occurred on different dates, involved different people, and had different official responses.

**Example of what TO do:**
- If three outlets cover the same person being detained on the same day, that's one incident with three sources.

**Key question:** Is this describing the same event with the same people on the same date? If no, create separate incidents.

## Step 1: Verify the Incident

Before adding, ensure:

1. **At least one credible source** (news outlet, official statement)
2. **Assign trustworthiness based on criteria below**
3. **Avoid**: Single social media posts without corroboration

## Step 1.5: Search for Additional Sources (ALWAYS DO THIS)

**⚠️ CRITICAL:** Even when the user provides a source, ALWAYS search for additional coverage before creating the incident file. Do not create an incident with only the source the user gave you.

**Why this matters:**
- Major stories are typically covered by multiple outlets
- Additional sources improve trustworthiness rating
- Different outlets may have different details (names, times, quotes)
- Video evidence may exist that the user didn't find

**Search procedure:**
1. Take key details from the provided source (names, location, date, agency involved)
2. Run 2-3 parallel web searches:
   - `"[affected individual name]" ICE Minnesota [date]`
   - `[location] ICE [month year]`
   - `[key phrase from story] Minnesota`
3. Check if major outlets covered it (NYT, WaPo, NBC, CBS, ABC, PBS, local TV)
4. Add all discovered sources to the incident file

**Example from actual session:**
- User provided: 1 NYT article about contempt order
- After searching: Found 8 sources (NBC, WaPo, CBS, ABC, PBS, NewsNation, Inquirer)
- Result: Much stronger incident file with comprehensive sourcing

**Do NOT skip this step** just because the user gave you a link. The user expects you to do the research.

### Citizen Checks Are Valid Incidents

Well-sourced stories from major news outlets documenting U.S. citizens being stopped and subjected to citizenship checks are valid incidents, even if the citizen was not ultimately detained. These incidents demonstrate the pattern of racial profiling affecting American citizens. If a citizen was surrounded, stopped, questioned, or had to prove their citizenship, that qualifies as an incident.

**Title format:** Prefix the title with "Citizen Check:" for these incidents. Example:
```
# Citizen Check: U.S. Citizen Surrounded by ICE Agents at West St. Paul Restaurant
```

### Citizens vs Observers — Choosing the Right Type

Both `citizens` and `observers` may involve U.S. citizens being detained. Choose based on **WHY they were targeted**:

| Type | Use When | Examples |
|------|----------|----------|
| `citizens` | Person was **racially profiled or mistakenly targeted** while going about daily life | On lunch break, driving, shopping, shoveling snow, leaving work |
| `observers` | Person was **targeted for filming, observing, or protesting** ICE operations | Following ICE vehicles, responding to alerts, filming arrests, at protests |

**Key question:** Was the person targeted for WHO THEY ARE (citizens) or WHAT THEY WERE DOING (observers)?

## Trustworthiness Rating Criteria

**IMPORTANT:** Use exactly one of these four values: `high`, `medium`, `low`, `no-news-media`. Do NOT use compound ratings like "medium-high" or "low-medium".

### HIGH - Strong Evidence
Assign HIGH when ANY of these conditions are met:

| Condition | Example |
|-----------|---------|
| 3+ independent sources | Star Tribune + MPR + Fox 9 all covering incident |
| Video/photo evidence | Bystander video shows incident, news embeds footage |
| Investigative report from major outlet | The Intercept, ProPublica, major newspaper with named sources and direct quotes |
| Single source + official corroboration | News report + ICE confirms arrest, or + lawsuit filed |
| Single source + credible primary sources | Article with named elected officials, attorneys, or direct affected individual interviews |

**Examples of HIGH with single source:**
- The Intercept detailed account with named affected individual and direct quotes → HIGH
- Sahan Journal report with city council member as witness → HIGH
- Local paper report + ICE confirmation of arrest → HIGH

### MEDIUM - Moderate Evidence
Assign MEDIUM when:

| Condition | Example |
|-----------|---------|
| 2 independent sources | Two separate news outlets cover incident |
| Official statement only | DHS press release without independent verification |
| Single established local source | Star Tribune or Pioneer Press report, no corroboration |
| Social media + one news pickup | Facebook video + one news article citing it |

### LOW - Limited Evidence
Assign LOW when:

| Condition | Example |
|-----------|---------|
| Single smaller outlet | Community paper or blog only |
| Social media with limited pickup | Facebook/X post, minimal news coverage |
| Conflicting details | Sources disagree on key facts |

### NO-NEWS-MEDIA
- Reported but not independently confirmed
- Anonymous tips without supporting evidence
- Rumor or speculation

**Special Formatting for NO-NEWS-MEDIA incidents:**

NO-NEWS-MEDIA incidents require additional formatting to clearly communicate their verification status:

1. **Title suffix**: Add `(NO NEWS MEDIA)` to the end of the title
2. **Warning message**: Add bold italic disclaimer between title and Summary:

```markdown
# Incident Title (NO NEWS MEDIA)

***Documented by social media posts. If you know of press coverage, please [contact us](mailto:mnicewitness@gmail.com).***

## Summary
```

This allows editorial judgment about incidents worth documenting while clearly indicating verification level to readers.

### Witness Corroboration Rule

**IMPORTANT:** Even well-reported incidents should be rated MEDIUM (not HIGH) if:

| Condition | Why It Limits Rating |
|-----------|---------------------|
| No independent firsthand witnesses on scene | Cannot corroborate the account beyond affected individual's word |
| Account relies solely on affected individual/family statement | No third-party verification of events |
| Agency disputes incident occurred (e.g., "zero record") | Creates he-said/she-said without independent evidence |

**Example:** A U.S. citizen claims they were stopped by ICE. Multiple news outlets report the story based on the citizen's account. However, no bystanders witnessed the stop, no video exists, and ICE claims "zero record" of the incident. This should be rated **MEDIUM** despite widespread media coverage, because the coverage is all sourced from a single account without independent corroboration.

### Good Sources
- Local news: KARE11, Fox9, KSTP, MPR News, Star Tribune, Pioneer Press
- National news: CNN, NPR, NBC, ABC, CBS, AP, Reuters
- Investigative: The Intercept, ProPublica
- Specialty: Sahan Journal (immigration), ICT (Native issues)
- Official: City of Minneapolis, MN AG, court documents

### Operation PARRIS Context
If the incident involves a refugee or immigrant with **pending legal status** (I-130, green card application, etc.) being detained, add an Operation PARRIS context section. See [operation-parris.md](operation-parris.md) for details below.

### Source Requirements

**Every source MUST:**
1. **Be directly about the incident** - Link to specific content about this incident
2. **Have a valid, working link** - No link = not a source
3. **Be accessible** - Behind-login-wall content without visible incident information is not a source

**NOT valid sources:**
- Business homepages or general profile pages
- Social media profile pages (only specific posts about the incident count)
- Pages that don't mention the incident
- Social media content (Facebook, Instagram, TikTok, etc.) where you know the video/post exists but cannot find the direct URL — do not add a linkless entry as a source

### Needs Corroboration
- Facebook posts
- X/Twitter posts (unless from officials)
- Reddit threads
- GoFundMe pages
- Single witness accounts

### Source Formatting

**Format:** `N. Outlet Name (Mon DD, YYYY): [Title](URL)`

**See `incident-schema.md` for full formatting rules and platform-specific examples.**

## Common Mistakes to Avoid

These are common mistakes when adding incidents. Read this section carefully.

### Citing Sources You Haven't Read — CRITICAL

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Linking to an article without reading it | The article may be about a DIFFERENT incident/person | Always fetch and read the source first |
| Using a URL that looks right based on the title | URL titles can be misleading or reused | Verify the content matches your claim |
| Adding sources from search result snippets only | Snippets may be out of context or outdated | Read the full article |

**⚠️ This has caused real errors.** A previous session linked a Sahan Journal article about one case (north Minneapolis shooting detainees) to an update about a completely different person (Tobay Robles). The URL looked plausible, but the article was about different people entirely.

**Required workflow:**
1. Before citing ANY source, use WebFetch to read the actual content
2. Verify the article mentions the specific person/incident you're documenting
3. If WebFetch fails or returns CSS/login walls, **print the URL and ask the user to paste the article text** — do this one URL at a time
4. Never assume a URL is correct based on the title alone

**If you cannot access a source:** Print the full URL, then ask: "Please paste the text so I can verify it covers this incident."

### Inventing Details Not in Sources — CRITICAL
| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Writing "zip-tied" when source says "untied" | Specific detail not in source | Use "restrained" or "tied up" |
| Writing "slammed to ground" when source says "dragged" | Adding violence not described | Use exact language from source |
| Adding specific weapons, numbers, or methods not stated | Fabrication damages credibility | Only include what sources explicitly state |

**⚠️ This is a critical error.** If a source says someone was "untied," you know they were restrained — but you do NOT know with what. Do not write "zip-tied," "handcuffed," or any other specific restraint unless a source explicitly says so. Use general terms like "restrained" that match what's actually documented.

### Timestamps — Common Error
| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `2026-01-19T12:00:00` | Rounded times are obviously wrong | Run `./bin/timestamp.sh` FIRST, then copy-paste |
| `2026-01-19T14:30:00` | Round numbers reveal guessing | Never type timestamps from memory |
| Typing ANY timestamp manually | Manually-entered timestamps are often wrong | Script output is the ONLY valid source |

**⚠️ This is a very common error.** Before editing ANY timestamp field, run `./bin/timestamp.sh` and copy its output. Do not proceed without doing this step first.

### Source Formatting
| Mistake | Why It's Wrong | Correct Format |
|---------|---------------|----------------|
| `[Instagram post](URL) - Source` | Wrong order, missing date | `Instagram Post (Jan 15, 2026): [description](URL)` |
| `Star Tribune (Jan 2026): [Title](URL)` | Missing day in date | `Star Tribune (Jan 15, 2026): [Title](URL)` |
| Source without any link | No link = not a source | Every source must have a clickable URL |
| Business homepage as source | General pages don't prove anything | Link to specific post/article about incident |
| `- **VIDEO** [Title](URL)` | Wrong format entirely | `Instagram Video (Jan 15, 2026): [Title](URL)` |

### Source Ordering
| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| "Videos first, then articles" | Misleading oversimplification | Best/most compelling first - could be video OR article |
| Putting syndicated content first | Yahoo/AOL reposts are less valuable | Original reporting first, syndication last |

### Internal Links
| Mistake | Why It's Wrong | Correct Format |
|---------|---------------|----------------|
| `[link](2026-01-15-incident.md)` | Links to raw .md file | `[link](#2026-01-15-incident)` |
| `[link](https://mnicefiles.com/#slug)` | Hardcodes domain | `[link](#slug)` |

### Trustworthiness
| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| `trustworthiness: medium-high` | Compound values not allowed | Pick exactly one: high, medium, low, no-news-media |
| Rating HIGH without corroboration | Single-source stories need verification | See witness corroboration rule |

### last_updated
| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| Updating for every source added | Pollutes "Sort by Updated" view | Only update when adding a `## Updates` entry |
| Updating for formatting fixes | Not a story development | Only update when adding a `## Updates` entry |
| Updating without adding `## Updates` entry | Timestamp and Updates must stay in sync | If no `## Updates` entry, don't touch `last_updated` |

## Step 2: Create the File

1. Determine the date of the incident
2. Create file in correct folder:
   ```
   docs/incidents/2026-01/15/2026-01-15-description-slug.md
   ```
3. Use lowercase, hyphens, no spaces in filename
4. Create the day subfolder if it doesn't exist (e.g., `mkdir -p docs/incidents/2026-01/15`)

**Non-standard dates** (early, unknown, etc.) stay at the month level:
```
docs/incidents/2026-01/2026-01-early-description-slug.md
```

**IMPORTANT:** All incident files go in `docs/incidents/`, NOT a root-level `incidents/` folder.

## Step 3: Write the Content

### Language Guidelines

**This site's credibility depends on neutral, documentary tone.** Avoid emotional, excited, or loaded language throughout — in titles, summaries, source descriptions, and narrative text.

#### Terminology: "Affected Individual(s)" NOT "Victim(s)"

**IMPORTANT:** We use **"Affected Individual(s)"** instead of "Victim(s)" throughout this project.

- **Section headers:** Use `## Affected Individual(s)` not `## Victim(s)`
- **Frontmatter field:** Use `affected_individual_citizenship:` not `victim_citizenship:`
- **In prose:** Say "the affected individual" or "affected individuals" — not "the victim" or "victims"

**Why?** "Victim" carries emotional weight and implies a judgment. "Affected individual" is neutral and factual — it describes someone involved in an incident without prejudging the situation. This aligns with our goal of documentary journalism that presents facts and lets readers draw their own conclusions.

**Exceptions where "victim" is acceptable:**
- Direct quotes from sources (news articles, officials, witnesses) — preserve the original language
- When discussing the terminology itself (e.g., "Bovino claimed agents were 'the victims'")
- When referencing how others frame the situation (e.g., "officials blamed the victim")
- In titles/headlines that quote official statements about victimhood

#### Neutral Language Table

| Avoid (Emotional/Loaded) | Use Instead (Neutral) |
|--------------------------|----------------------|
| raid, ransack | search |
| storm, invade | enter |
| kidnapped, snatched | detained, arrested |
| terrorize, brutalize | use force on |
| horrific, shocking, disturbing | (omit - describe facts) |
| innocent victim | person, resident, citizen, affected individual |
| exclusive, breaking, bombshell | (omit - just describe content) |
| explosive interview | interview |

**Source descriptions should be plain and factual:**
- Say "interview" not "exclusive interview"
- Say "video" not "shocking video" or "disturbing footage"
- Say "first on-camera interview" not "explosive first interview"
- Let readers judge the significance themselves

**General principles:**
- Report facts and let readers draw conclusions
- Witness/affected individual quotes may contain emotional language, but narrative text should not
- Describe actions objectively: "agents used a battering ram to enter" not "agents violently smashed through the door"
- Avoid superlatives and marketing language from news sources (strip out "exclusive," "shocking," etc.)
- **For official statements:** Report what was said accurately, not your interpretation. If an official says "vicious animals" referring to "murderers & criminals," don't editorialize that as "calling immigrants vicious animals." Let readers draw their own conclusions about the rhetoric.

#### ⚠️ CRITICAL: Use ONLY Language Found in Sources

**NEVER infer, embellish, or add specific details not explicitly stated in sources.**

| Source Says | DO NOT Write | DO Write |
|-------------|--------------|----------|
| "untied me" | "zip-tied" | "restrained" or "tied up" |
| "dragged from car" | "slammed to ground" | "dragged from car" |
| "detained" | "arrested and jailed" | "detained" |
| "agents" | "armed officers" | "agents" |

**Why this matters:**
- "Untied" implies restraint, but doesn't specify the type — writing "zip-tied" is an assumption
- Even reasonable inferences can be wrong and damage credibility
- If a detail isn't in the source, it's not in our file

**If you want to include a detail:** Find a source that explicitly states it. If you can't find one, use the more general language from existing sources.

### Fair Use and Summary Length

**Our entries must not replace the original article.** This is both a legal requirement (copyright fair use) and an ethical one — we want to drive readers to the journalists who did the reporting, not substitute for them.

**The core test:** After reading our entry, would a reasonable reader still need to visit the source to get the full story? If the answer is no, our entry is too detailed.

**Why this matters legally:** Under *AP v. Meltwater* (2013) and *Advance Local Media v. Cohere* (2025), summaries detailed enough to replace the original article — even paraphrased ones that mirror the journalist's narrative structure — can constitute copyright infringement. The "market substitution" factor (does our summary reduce the need to read the original?) is what the Supreme Court calls "the single most important element of fair use." This risk is highest with paywalled sources like the Star Tribune, where our free summary directly competes with their subscription model.

**What protects us:** Facts are not copyrightable. Names, dates, locations, outcomes, and government actions are free for anyone to report. Our cross-referencing, pattern analysis, and multi-source synthesis add genuinely new value. What IS protected: the journalist's specific word choices, narrative structure, and storytelling decisions.

#### Single-source entries (especially paywalled sources)

These carry the highest fair use risk. The entry must be a pointer to the source, not a retelling.

| Element | Guideline |
|---------|-----------|
| **Summary** | 2-3 sentences of bare facts (who, what, where, when, outcome) |
| **Narrative sections** | No "What Happened" section — retelling a single journalist's story is substitutive |
| **Direct quotes** | Maximum 1 short quote, and only if essential to document the civil rights issue |
| **Affected Individual(s)** | Name, age, nationality, immigration status — essentials only |
| **Do not include** | Health details, family background stories, emotional scenes, departure narratives, or other details that constitute the journalist's storytelling |

**The reader should want to click through** to the source for the full story.

#### 2-3 source entries

| Element | Guideline |
|---------|-----------|
| **Summary** | 3-4 sentences |
| **Timeline** | Permitted if based on facts from multiple accounts |
| **Direct quotes** | Maximum 2 short quotes from different sources |
| **Affected Individual(s)** | Can include more detail when sourced from multiple outlets |

#### 5+ source entries (synthesis)

Combining many independent sources into a unified account is genuinely transformative and carries low fair use risk.

| Element | Guideline |
|---------|-----------|
| **Narrative sections** | Justified when synthesizing many independent reports |
| **Quotes** | From different sources — creates new context no single article provides |
| **Pattern analysis** | Cross-referencing incidents adds original value |
| **Detail level** | Can be higher because no single source is being substituted |

#### Always safe to include (regardless of source count)

- **Bare facts:** Names, dates, locations, agencies involved, outcomes (facts are not copyrightable)
- **Our own cross-references:** Links to related incidents on our site
- **Pattern context:** How this incident connects to broader enforcement trends
- **Public records:** Court filings, government press releases, official statements
- **Our editorial assessment:** Original analysis of source credibility

#### Always avoid (regardless of source count)

- **Reproducing a journalist's narrative structure** — if the article tells the story chronologically from dawn to departure, organize your summary differently
- **Extensive direct quotes from a single article** — quotes are often "the heart of the work" (*Harper & Row v. Nation Enterprises*)
- **Details that exist only to tell the human story** (farewell gatherings, weather descriptions, emotional scenes) — these are the journalist's creative work, not facts needed for civil rights documentation
- **Paraphrasing that mirrors the original's storytelling choices** — even rewriting in your own words can infringe if you follow the same narrative arc (*Advance Local Media v. Cohere*)

Use the schema from `incident-schema.md`. At minimum include:

#### ⚠️ TIMESTAMP WARNING
**Set `created` and `last_updated` to the ACTUAL CURRENT TIME** when you create the file — not a rounded or made-up time.

**To get the current timestamp, run:**
```bash
./bin/timestamp.sh
```

Use the output for BOTH `created` and `last_updated` fields. **Never guess or make up a timestamp** — manually-entered timestamps are often wrong.

**⚠️ NEVER backdate `last_updated`** — Even when adding an old incident from months ago, both timestamps must be TODAY (when you create the file). The `last_updated` field tracks when WE updated our site, not when the story had its last news coverage.

```markdown
---
date: 2026-01-15
time: unknown
location: Specific location
city: Minneapolis
type: citizens
status: resolved
affected_individual_citizenship: us-citizen
injuries: none
trustworthiness: medium
created: 2026-01-15T14:23:47   # ← Use ACTUAL current time, not rounded!
last_updated: 2026-01-15T14:23:47   # ← Same as created for new incidents
---

# Title of Incident

## Summary
What happened in 2-3 sentences.

## Sources
1. [Source](URL) - Publication
- **Video:** [Description](URL) - Source (if available)

## Affected Individual(s)
- **Name:** If public
- **Citizenship:** Status

## Editorial Assessment
**MEDIUM** - Why this rating.
```

## Step 4: Generate Summary JSON

**Critical step!** Run the summary generator to update the data files:

```bash
python-main scripts/generate_summary.py
```

This reads all markdown files in `docs/incidents/` and generates:
- 5 category JSON files (`docs/data/incidents-summary-*.json`)
- Search index (`docs/data/search-index.md`)

**IMPORTANT:** Do NOT edit these files directly - they are auto-generated by the script and pre-commit hook.

## Step 5: Test Locally

```bash
./bin/run-server.sh
# Open http://localhost:8000
```

Verify:
- Incident appears in correct section
- Card displays properly
- Lightbox opens with full content
- Links work

## Step 6: Commit

```bash
git add docs/incidents/2026-01/15/2026-01-15-new-incident.md
# Category JSON files and search-index.md are auto-staged by pre-commit hook
git commit -m "Add incident: Title of incident"
git push
```

## Updating Existing Incidents

When new information emerges:

1. **Read the entire incident file first** — Incident files are short. Before making any changes, read the whole file to understand the current state and ensure your updates will be consistent with existing content.
2. **If updating `last_updated`** — Run `./bin/timestamp.sh` FIRST and copy the output
3. Edit the markdown file
4. **For major story updates:** Add/update the `## Updates` section **RIGHT AFTER THE TITLE, BEFORE SUMMARY** (see below)
5. **Only update `last_updated` for substantive story changes** (see below)
6. Paste the timestamp from step 2 into `last_updated` (do NOT type it manually)
7. Add new sources to Sources section
8. Update Editorial Assessment if trustworthiness changes
9. **Re-read the entire file** — Verify everything is consistent: notes don't contradict sources, editorial assessment matches the evidence, no outdated statements remain. Remove any notes that are now incorrect (e.g., "link not available" when you just added the link).
10. Commit with message like "Update: New video evidence for Speedway incident"

**⚠️ CRITICAL:** Never type a timestamp like `2026-01-22T12:00:00` from memory. Manually-entered timestamps are often wrong. The script is the ONLY valid source for timestamps.

**⚠️ CRITICAL:** The `## Updates` section goes at the TOP of the document (after title, before Summary), NOT at the bottom. This is user-facing content that readers see first.

### When to Update `last_updated`

**CRITICAL RULE:** Only update `last_updated` when you are ALSO adding an entry to the `## Updates` section at the top of the file. The timestamp and Updates section must stay in sync.

- Adding a source? **DO NOT** touch `last_updated`
- Adding an `## Updates` entry about a case development? **DO** update `last_updated`

The `last_updated` field powers the "Sort by Updated" feature on the website. Only update it for **substantive story developments** — not routine maintenance.

#### ⚠️ USE THE ACTUAL CURRENT TIME (Critical!)

**When you update `last_updated`, use the EXACT current time** — not a rounded or made-up time.

| Example | Correct? |
|---------|----------|
| `2026-01-19T14:23:47` | ✅ Actual time when making the change |
| `2026-01-19T12:00:00` | ❌ Rounded time (clearly made up) |
| `2026-01-19T14:30:00` | ❌ Rounded time (clearly made up) |

**Why?** Incorrect timestamps break the sort order and mislead users about when content was actually updated.

**Format:** Full ISO 8601 timestamp with seconds: `YYYY-MM-DDTHH:MM:SS`

#### DO Update `last_updated` For:
| Change Type | Examples |
|-------------|----------|
| **Case developments** | Judge ruling, person released, charges filed, lawsuit filed |
| **Status changes** | Detained → Released, Under investigation → Resolved |
| **New facts about the incident** | Affected individual identity confirmed, location corrected, new details emerge |
| **Merging incidents** | When combining duplicate incident files |
| **Significant new witness accounts** | Major new testimony that changes understanding |

#### DO NOT Update `last_updated` For:
| Change Type | Why Not |
|-------------|---------|
| Adding more sources | Just expands documentation, doesn't change the story |
| Formatting/schema changes | Internal maintenance |
| Trustworthiness rating changes | Editorial judgment, not story change |
| Typo fixes | Cosmetic |
| Adding video/photo links | Just more documentation |

**Rationale:** Users who sort by "Updated" want to see incidents where something actually happened — a release, a ruling, new facts. They don't want to see incidents bubble up just because someone found another news article.

#### Example Commit Messages:
- ✅ "Update Gibson: judge orders release" → DO update `last_updated`
- ❌ "Add 5 new sources to Renee Good incident" → DO NOT update `last_updated`
- ❌ "Standardize source formatting" → DO NOT update `last_updated`

#### Adding an Updates Log

When making a MAJOR update to an incident, add an `## Updates` section right after the title (before Summary):

```markdown
# Incident Title

## Updates
- **Jan 18** - Added press conference: trophy photos allegation, overcrowded cell
- **Jan 18** - Gibson re-arrested, then released again; now on ankle monitor
- **Jan 18** - Federal judge rules arrest violated Fourth Amendment, orders release

## Summary
...
```

**Format:**
- Use simple dates like "Jan 18" — NOT full timestamps
- End each update with a period
- Hyperlink to the source within the text (don't write out URLs)
- **Keep updates BRIEF** — 1-2 sentences max with hyperlinks. Put detailed information in a new section in the body of the incident (e.g., a new `## Section Name` with full facts, bullet points, quotes)

**Example with hyperlink:**
```markdown
- **Jan 22** - [KSTP investigation](URL) reveals target has been in prison since 2024.
```

**Write in plain language** — describe what happened, not what you did:
- ✅ "[KSTP investigation](URL) reveals target has been in prison since 2024."
- ✅ "Gibson alleges ICE took 'trophy photos' of him."
- ❌ "Added press conference details"
- ✅ "Nasra Ahmed describes being chained 'like Hannibal Lecter'."
- ❌ "Added affected individual's first-person account; upgraded to HIGH trustworthiness"

Never mention internal details like trustworthiness changes, source additions, or schema updates. Users don't care about our process — they want to know what happened.

**Most incidents will NOT have an Updates section.** Only add it when there are major story developments worth tracking.

### NEVER Remove Valid Sources

**CRITICAL:** Never remove sources from an incident just because:
- A better version exists (e.g., video with original audio vs. one with music overlay)
- The source seems redundant
- You think another source covers it better

We want ALL valid sources documented. Let users decide what they care about. If one version is better than another, add a note in parentheses to clarify (e.g., "original audio" or "music overlay") but keep both.

**Only remove sources that are:**
- Fake or fabricated
- Proven false or misleading
- From unreliable/disreputable sources
- Permanently broken links (not just temporarily down)

## Bulk Research Tips

When researching multiple incidents:

1. Search news sites for "ICE Minneapolis" filtered to date range
2. Check @DHSgov on X for their responses (include these!)
3. Search "Minneapolis ICE" on YouTube for video evidence
4. Check Sahan Journal for immigration-focused coverage
5. Check ICT (Indian Country Today) for Native American incidents

## DHS Responses

Always include DHS's official response when available:

1. Check [@DHSgov on X](https://x.com/DHSgov)
2. Check [DHS press releases](https://www.dhs.gov/news)
3. Check [ICE news releases](https://www.ice.gov/news/releases)

Quote them directly, then note if evidence contradicts their claims.

## Operation PARRIS Context Section

When an incident involves a refugee or immigrant with **pending legal status** being detained, add a "Context: Operation PARRIS" section. This helps readers understand the broader pattern of targeting people with active immigration cases.

### When to Add This Section

Add when ANY of these apply:
- Affected individual had an approved or pending I-130 petition
- Affected individual was a refugee awaiting green card
- Affected individual had valid immigration documents and was in a legal process
- Affected individual was detained despite having legal status

### How to Add

**Two things to add:**

1. **Add note at end of Summary section:** `<em style="color: #888;">**Note: This story seems to follow a pattern of Operation PARRIS (Post-Admission Refugee Reverification and Integrity Strengthening) -- see more details on this below.**</em>`

2. **Add Context section before Editorial Assessment:**

```markdown
## Context: Operation PARRIS

[Affected individual's name]'s detention fits a documented pattern of ICE targeting refugees with pending green card applications under **Operation PARRIS** (Post-Admission Refugee Reverification and Integrity Strengthening). According to [Fox 9](https://www.fox9.com/news/minnesota-fraud-dhs-launching-operation-parris-target-refugees-jan-9), approximately 5,600 green card applicants in Minnesota are being targeted through this [official DHS operation](https://www.uscis.gov/newsroom/news-releases/dhs-launches-landmark-uscis-fraud-investigation-in-minnesota).

[Global Refuge](https://www.globalrefuge.org/news/refugee-arrests-minnesota/) has documented that lawfully present refugees are being detained and transported to Texas within 24 hours with "no due process, no access to an attorney."
```

See [operation-parris.md](operation-parris.md) for full details and sources.
