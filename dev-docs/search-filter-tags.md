# Search Filter Tags

Tags are added to incident frontmatter via the `search_tags` field. They power the checkbox filters in the search modal. Tags do not display on the incident page itself.

## Frontmatter Format

```yaml
search_tags: children, chemical-agents, us-citizen, src:fox9, src:star-tribune, src:cnn
```

Comma-separated list. Topic tags are plain values; source tags use the `src:` prefix.

## Topic Tags

All topic tags are **cross-cutting** — they apply across every main category (citizens, observers, immigrants, schools-hospitals, response, background). When tagging a new incident, check each tag independently regardless of which main category the incident belongs to.

### Status Tags

| Tag | Label | Use When |
|-----|-------|----------|
| `us-citizen` | U.S. Citizen | A U.S. citizen was detained, arrested, hurt, shot, or killed — in ANY category. An observer who is a citizen gets both `observer-detained` AND `us-citizen`. A schools-hospitals incident involving a citizen parent gets `us-citizen` too. |
| `legal-resident` | Legal Resident | A person with legal status (green card, visa, TPS, work permit, refugee authorization, asylum) was targeted — in ANY category. Same cross-cutting logic as `us-citizen`. |
| `citizen-check` | Citizen Check | Agents demanded ID or questioned citizenship/immigration status of someone lawfully present. Includes roadside stops, workplace checks, bus/transit stops where papers were demanded. |

### Observer Tags

| Tag | Label | Use When |
|-----|-------|----------|
| `observer-intimidated` | Observer Intimidated | Bystander, protester, clergy, or journalist harassed, shoved, sprayed, or threatened for observing/filming. Does NOT require arrest — intimidation alone qualifies. |
| `observer-detained` | Observer Detained | Observer, bystander, journalist, or protester physically held, arrested, cuffed, or transported by agents. Must involve actual detention, not just verbal threats. |

### Theme Tags

| Tag | Label | Use When |
|-----|-------|----------|
| `children` | Children | Children (under 18) directly affected: present during raids, separated from parents, detained, targeted at bus stops, school impacts, or used as leverage. |
| `chemical-agents` | Pepper Spray / Tear Gas | Any chemical irritant deployed: pepper spray, OC spray, pepper rounds/balls, tear gas (CS gas), flashbangs, smoke grenades, or other chemical munitions. |
| `excessive-force` | Excessive Force | Physical force beyond what the situation warranted: beatings, tackling, dragging, head injuries, rubber bullets, pointing firearms at unarmed people, ramming vehicles into people. |
| `family-separation` | Family Separation | Family members separated by detention or deportation. Parent taken from children, spouse detained, family split across facilities or countries. |
| `workplace-raid` | Workplace Raid | ICE/CBP action at a workplace or business: factory raids, restaurant inspections, construction site arrests, employer audits that led to detentions. |
| `deception` | Deception / Ruse | Agents used false pretenses: posed as police/delivery/social workers, lured someone out with a fake story, made false promises, or tricked employers/schools into providing access. |
| `native-american` | Native American | Indigenous/Native American people affected, or enforcement actions on/near tribal land, reservations, or Native community spaces (e.g., Little Earth, powwow grounds). |
| `shooting` | Shooting | Firearm discharged by agents or during an ICE operation. Includes fatal and non-fatal shootings. Also tag when guns are pointed at unarmed civilians. |
| `vehicle-pursuit` | Vehicle Pursuit | Agents pursued, chased, rammed, boxed in, or struck someone with a vehicle, OR a vehicle chase/pursuit led to a crash or collision. Includes high-speed pursuits, agents ramming civilian vehicles, agents driving into protesters, and multi-vehicle boxing-in tactics on highways. |
| `warrantless-entry` | Warrantless Entry | Agents entered a home, business, or vehicle without a judicial warrant. Includes forced entry (battering rams, breaking windows) and coerced consent. |
| `operation-parris` | Operation PARRIS | Incident connected to Operation PARRIS (Post-Admission Refugee Reverification and Integrity Strengthening) — DHS/USCIS program targeting ~5,600 refugees in Minnesota with pending green card applications. Use when the affected person is a refugee with legal status and a pending immigration application who was detained despite lawful presence. See `dev-docs/operation-parris.md` for criteria. |

## Source Tags

### MN Local News

| Tag | Label |
|-----|-------|
| `src:star-tribune` | Star Tribune |
| `src:mpr` | MPR News |
| `src:fox9` | FOX 9 |
| `src:kare11` | KARE 11 |
| `src:wcco` | WCCO |
| `src:kstp` | KSTP |
| `src:sahan-journal` | Sahan Journal |
| `src:bring-me-the-news` | Bring Me The News |
| `src:pioneer-press` | Pioneer Press |
| `src:mn-reformer` | Minnesota Reformer |
| `src:other-local` | Other Local News (Hometown Source, KTTC, Post Bulletin, Racket, InForum, Southern MN News, MinnPost, West Central Tribune, Mankato Free Press, St. Cloud Live, etc.) |

### National News

| Tag | Label |
|-----|-------|
| `src:cnn` | CNN |
| `src:nyt` | New York Times |
| `src:wapo` | Washington Post |
| `src:npr` | NPR |
| `src:intercept` | The Intercept |
| `src:ap` | Associated Press |
| `src:nbc` | NBC News |
| `src:cbs` | CBS News (national) |
| `src:abc` | ABC News |
| `src:fox-news` | Fox News (national) |
| `src:pbs` | PBS |
| `src:other-national` | Other National / International (The Hill, Common Dreams, Raw Story, Newsweek, The Mirror, The Daily Beast, Democracy Now, Reuters, BBC, Al Jazeera, Axios, HuffPost, Salon, New Republic, etc.) |

### National vs. Local Disambiguation

| Local (MN) | National |
|------------|----------|
| FOX 9 (`src:fox9`) | Fox News (`src:fox-news`) |
| WCCO (`src:wcco`) | CBS News (`src:cbs`) |
| KARE 11 (`src:kare11`) | NBC News (`src:nbc`) |
| KSTP (`src:kstp`) | ABC News (`src:abc`) |

## What Counts as a Source

**Tag these:** Named news organizations in the `## Sources` section of the incident file.

**Do NOT tag:** Court filings, declarations, social media posts (X, Facebook, Reddit, TikTok, Instagram, Threads, Bluesky), GoFundMe, Wikipedia, or YouTube unless it's a video from a news org (e.g., "FOX 9 / YouTube" → `src:fox9`).

## Filter Logic

- **Within Topics:** OR (matches if incident has ANY selected topic tag)
- **Within Sources:** OR (matches if incident has ANY selected source tag, across both MN Local and National groups)
- **Between Topics and Sources:** AND (must match at least one from each group when both have selections)
- **Text search** works alongside tag filters (results must match both)

## Adding New Tags

1. Add the tag value to this doc
2. Add a `<label class="filter-chip">` checkbox in `docs/index.html` inside the appropriate `.filter-group`
3. Start tagging incidents with the new value in their `search_tags` frontmatter

## Validation

The pre-commit hook validates all `search_tags` values via `generate_summary.py`. Invalid tags **block the commit** with an error listing the bad tags and pointing to this file. The valid tag set is defined in `VALID_SEARCH_TAGS` in `scripts/generate_summary.py` — keep it in sync with this doc when adding new tags.

## Common Mistakes

| Wrong | Correct | Why |
|-------|---------|-----|
| `src:nytimes` | `src:nyt` | Standard abbreviation |
| `src:bmtn` | `src:bring-me-the-news` | Full slug required |
| `src:cspan` | `src:other-national` | C-SPAN not in named list |
| `src:minnpost` | `src:other-local` | MinnPost not in named list |
| `src:duluth-news-tribune` | `src:other-local` | Use `src:other-local` for all non-named local outlets |
| `src:status-coup` | `src:other-national` | Not in named list |
| `src:cbs` for cbsnews.com/minnesota | `src:wcco` | CBS Minnesota = WCCO |
| `home-visit` | *(remove)* | Not a valid tag |
| `journalist` | *(remove)* | Not a valid tag; use `observer-detained` or `observer-intimidated` |
| `racial-profiling` | *(remove)* | Not a valid tag; use `citizen-check` if applicable |
| `medical-neglect` | *(remove)* | Not a valid tag |

**Key rule:** If a source or topic isn't in the tables above, don't invent a tag. Use `src:other-local`, `src:other-national`, or omit the topic tag.

## Reindexing

From time to time, the full set of incidents should be re-audited for tags. Reasons to reindex:

- A theme that was below the 3-incident threshold may have grown
- New news sources may have started covering incidents
- New topic themes may emerge
- Existing tags may need adjustment based on new context

To reindex: Read all incident files, compare themes and sources against the current tag set, and update `search_tags` in each file. Then run `python-main scripts/generate_summary.py` to rebuild the JSON cache.
