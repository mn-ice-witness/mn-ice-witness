# Corrected Incidents Procedure

How to handle incidents that are real but contain significant factual errors that need correction.

## Key Distinction: Corrected vs Removed

- **Removed** = The incident itself is invalid. Core claims were disproven, the incident didn't happen as reported, or it no longer belongs on this site. Removed incidents are **hidden from the main listing** and shown only at `/removed`.
- **Corrected** = The incident is real and **stays on the main listing** under its category. However, significant factual claims within the entry were wrong and have been corrected. The `/corrections` page is an additional transparency index — it does NOT replace the main listing.

**Simple test:** Did the incident actually happen? If yes but with wrong details, it's **corrected**. If the whole thing is invalid, it's **removed**.

## When to Correct an Incident

Correct an incident when:
- A key factual claim (e.g., chemical identification, weapon type, person's identity) was wrong
- Expert analysis or official records contradict a specific claim in the entry
- The core incident is still valid and worth documenting, but needs factual fixes

## How to Correct an Incident

### 1. Update the Frontmatter

Update `last_updated` with a fresh timestamp:

```bash
./bin/timestamp.sh
```

### 2. Add ## Correction Section at the Bottom

**Do NOT add "(CORRECTED)" to the title.** The title stays clean. The `## Correction` section at the bottom of the incident and the `/corrections` page signal the correction.

**The `## Correction` section goes at the very bottom of the incident file.** The first line must be a bolded date followed by an em-dash and a brief description — this is what appears on the `/corrections` page.

```markdown
## Correction

**[Month Day, Year]** — [Brief description of what was corrected].
```

For complex corrections where the original claim requires detailed explanation, add subsections:

```markdown
## Correction

**[Month Day, Year]** — [Brief description of what was corrected].

**What was originally reported:** [Summary of original claims]

**What changed:** [What new information emerged, with sources]

**Why the original claim was wrong:** [Explain the evidence]

**Important context:** [Any nuance — e.g., the corrected thing isn't harmless either]
```

### 3. Update Summary Section

Rewrite the summary with corrected facts. Keep the heading as `## Summary`.

### 4. Add Correction Sources

```markdown
## Sources Added for Correction
XX. [Source Name](URL) - Brief description
```

### 5. Rename If Needed

If the incident ID contains the wrong claim (e.g., a chemical name that was disproven), rename the file following the `id-reassignment.md` procedure and add a redirect in `redirects.json`.

## How the System Works

- Corrected incidents **remain on the main page** under their category (schools-hospitals, citizens, etc.)
- They also appear at `/corrections` as a transparency index
- They appear in BOTH the CURRENT and CORRECTIONS sections of search-index.md
- They are included in category JSON files and the sitemap
- The `/corrections` page lists all corrected incidents with the brief correction description
- On the incident page itself, the `## Correction` section appears at the very bottom
- The `correctionNote` field in the summary JSON is extracted from the first line of `## Correction`
- All original slugs/URLs continue to work (via redirects if renamed)

## Files Involved

| File                             | What Changed                                                                      |
| :--------------------------------| :---------------------------------------------------------------------------------|
| `docs/js/router.js`              | `/corrections` route                                                              |
| `docs/js/app.js`                 | `getCorrectionsIncidents()`; corrected incidents NOT filtered from main display   |
| `docs/js/lightbox.js`            | `openCorrections()`, `renderCorrectionsContent()` (uses `correctionNote`),        |
|                                  | `setupCorrectionsLinks()`, `showCorrections()`                                    |
| `docs/about.md`                  | Corrections section and link                                                      |
| `functions/corrections/index.js` | Cloudflare Function for OG tags                                                   |
| `scripts/generate_summary.py`    | `corrected` in `VALID_TRUSTWORTHINESS`; `extract_correction()` for                |
|                                  | `correctionNote`; appears in CURRENT + CORRECTIONS sections                       |

## Examples

### Bovino Smoke Canister

`2026-01-21-bovino-smoke-canister-playground.md` (renamed from `bovino-hexachloroethane-playground`)

Social media claimed hexachloroethane (HC) gas. Three munitions experts identified it as a colored smoke grenade. The `## Correction` section at the bottom includes detailed subsections (What was originally reported, What changed, Why the original claim was wrong, Important context).

### Silva Sosa Inver Grove Heights

`2026-01-12-silva-sosa-inver-grove-heights.md`

Originally framed as Operation PARRIS targeting. The parents are undocumented immigrants, not refugees. The `## Correction` section at the bottom is a single line.

## Related Documentation

- `removed-incidents.md` - For incidents where the core claims are invalid
- `no-news-media-incidents.md` - For incidents that never had enough verification
- `id-reassignment.md` - For renaming incident IDs with redirects
