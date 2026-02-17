# Removed Incidents Procedure

How to handle incidents that were previously listed but need to be removed due to new information that contradicts the original reporting.

## When to Remove an Incident

Remove an incident when:
- The source walks back or retracts their original claims
- New information emerges that contradicts the core factual basis
- The affected individual's status/citizenship cannot be verified as originally claimed
- The incident no longer fits the project's documentation criteria based on new facts

**Key distinctions between removed, corrected, and no-news-media:**
- **No-news-media** = We never had news coverage to confirm the story
- **Removed** = The incident itself is invalid — core claims were disproven, the incident didn't happen as reported, or it doesn't belong on this site. Hidden from main listing, shown only at `/removed`
- **Corrected** = The incident is real and stays on the main listing, but significant factual claims within the entry were wrong and have been corrected. Shown on main page AND at `/corrections` for transparency

## How to Remove an Incident

### 1. Update the Frontmatter

Change `trustworthiness` from its current value to `removed`:

```yaml
trustworthiness: removed
```

Update `last_updated` with a fresh timestamp:

```bash
./bin/timestamp.sh
```

### 2. Add Correction Note After Title

Add `(REMOVED)` to the title and insert a correction note block:

```markdown
# Original Title Here (REMOVED)

***This incident has been removed from the main listing. See Correction Note below.***

## Correction Note (Date)

**Why this was removed:** [Explain what changed]

**The problem:** [Explain why this invalidates the original reporting]

**What was originally reported:** [Brief summary of original claims]

**What changed:** [What new information emerged]

---
```

### 3. Update Summary Section

Rewrite the summary with corrected facts. Keep the heading as `## Summary`.

### 4. Update Editorial Assessment

Change the assessment to explain the removal:

```markdown
## Editorial Assessment
**REMOVED** - [Explanation of why removed, referencing the contradicting sources]
```

### 5. Add Correction Sources

Add the sources that document the contradicting information:

```markdown
## Sources Added for Correction
XX. [Source Name (Date)](URL) - Brief description
```

### 6. Update the Updates Section

Add an update noting the removal:

```markdown
## Updates
- **[Date]** - **REMOVED** — [Brief reason]. See Correction Note above.
```

## How the System Works

- Removed incidents are filtered out of the main display (same as no-news-media)
- They appear at `/removed` for transparency
- All original slugs/URLs continue to work
- Readers can click through to see the full incident with correction notes

## Files Involved

| File | What Changed |
|------|--------------|
| `docs/js/router.js` | Added `/removed` route |
| `docs/js/app.js` | `getFilteredIncidents()` filters out `removed`; added `getRemovedIncidents()` |
| `docs/js/lightbox.js` | Added `openRemoved()`, `renderRemovedContent()`, `setupRemovedLinks()` |
| `docs/css/style.css` | Added `.about-badge-removed` styling |
| `docs/about.md` | Added Removed Incidents section and link |

## Example: Oglala Sioux Incidents

The first removed incidents were two Oglala Sioux detention reports from January 2026:

1. `2026-01-08-little-earth-native-americans.md` - Initial detention report
2. `2026-01-14-oglala-sioux-still-detained.md` - Follow-up on continued detention

**What happened:** The tribe initially announced four members were detained. Major national outlets covered the story. However, on January 16, 2026, the tribe acknowledged it could not confirm the detained individuals were actually tribal members.

**Why removed:** Without confirmed tribal membership, U.S. citizenship cannot be verified, and the core claim (U.S. citizens illegally detained) is unconfirmed.

## Related Documentation

- `no-news-media-incidents.md` - For incidents that never had enough verification
- `adding-incidents.md` - Standard procedure for adding new incidents
- `source-tiers.md` - Source credibility evaluation
