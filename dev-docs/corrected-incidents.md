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

Change `trustworthiness` to `corrected`:

```yaml
trustworthiness: corrected
```

Update `last_updated` with a fresh timestamp:

```bash
./bin/timestamp.sh
```

### 2. Add Correction Note After Title

Add `(CORRECTED)` to the title and insert a correction disclaimer and note:

```markdown
# Original Title Here (CORRECTED)

***This incident has been corrected. [Brief description of what was wrong]. See Correction Note below.***

## Updates
- **[Date]** - **CORRECTED** — [Brief description]. See Correction Note above.

## Correction Note (Date)

**What was originally reported:** [Summary of original claims]

**What changed:** [What new information emerged, with sources]

**Why the original claim was wrong:** [Explain the evidence]

**Important context:** [Any nuance — e.g., the corrected thing isn't harmless either]

---
```

### 3. Update Summary Section

Change `## Summary` to `## Summary (Original)` and rewrite the summary with corrected facts.

### 4. Update Editorial Assessment

```markdown
## Editorial Assessment
**CORRECTED** - [Explanation of what's confirmed vs what was wrong]
```

### 5. Add Correction Sources

```markdown
## Sources Added for Correction
XX. [Source Name](URL) - Brief description
```

### 6. Rename If Needed

If the incident ID contains the wrong claim (e.g., a chemical name that was disproven), rename the file following the `id-reassignment.md` procedure and add a redirect in `redirects.json`.

## How the System Works

- Corrected incidents **remain on the main page** under their category (schools-hospitals, citizens, etc.)
- They also appear at `/corrections` as a transparency index
- They appear in BOTH the CURRENT and CORRECTIONS sections of search-index.md
- They are included in category JSON files and the sitemap
- The `/corrections` page lists all corrected incidents with links to the full detail view
- All original slugs/URLs continue to work (via redirects if renamed)

## Files Involved

| File | What Changed |
|------|--------------|
| `docs/js/router.js` | Added `/corrections` route |
| `docs/js/app.js` | Added `getCorrectionsIncidents()`; corrected incidents NOT filtered from main display |
| `docs/js/lightbox.js` | Added `openCorrections()`, `renderCorrectionsContent()`, `setupCorrectionsLinks()`, `showCorrections()` |
| `docs/css/style.css` | Added `.about-badge-corrected` styling (blue) |
| `docs/about.md` | Added Corrections section and link |
| `functions/corrections/index.js` | Cloudflare Function for OG tags |
| `scripts/generate_summary.py` | `corrected` in `VALID_TRUSTWORTHINESS`; appears in CURRENT + CORRECTIONS sections |

## Example: Hexachloroethane Smoke Canister

The first corrected incident was the Bovino/Mueller Park smoke canister:

1. `2026-01-21-bovino-smoke-canister-playground.md` (renamed from `bovino-hexachloroethane-playground`)

**What happened:** Social media claimed Bovino deployed hexachloroethane (HC) gas, a chemical weapon. Three munitions experts identified the canister as a Defense Technology "Pocket Tactical Green Smoke" grenade — a colored smoke device, not HC. HC smoke is white/gray, never green.

**Why corrected, not removed:** Bovino DID deploy a smoke canister near a school at dismissal, and a school bus DID drive through the smoke. The incident is real. Only the chemical identification was wrong.

## Related Documentation

- `removed-incidents.md` - For incidents where the core claims are invalid
- `no-news-media-incidents.md` - For incidents that never had enough verification
- `id-reassignment.md` - For renaming incident IDs with redirects
