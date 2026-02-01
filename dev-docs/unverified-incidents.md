# Unverified Incidents Procedure

When an incident has `trustworthiness: unverified`, follow these guidelines:

## Display Behavior

Unverified incidents are **hidden from the main page** (both media gallery and list view). They only appear on the dedicated `/unverified` page, sorted by update date. This separation:
- Keeps the main site focused on verified incidents
- Provides a dedicated space for readers who want to help verify reports
- Prevents unverified claims from being mixed with confirmed incidents

## Required Elements

### 1. Plea for Information (Top of Body)
Immediately after the title, include a bold italic message asking for clarifying information:

```markdown
# Title (UNVERIFIED)

***[Brief statement of what we know]. If you have any information, please [contact us](mailto:mnicewitness@proton.me).***
```

### 2. State Only Facts We Know
- Document only what can be directly observed or confirmed
- No speculation about what the incident "could represent"
- No editorializing about significance or implications
- No hypothetical scenarios

### 3. Editorial Assessment
Keep it brief and factual:

```markdown
## Editorial Assessment
**UNVERIFIED** - [One sentence stating what we have and what's missing.]
```

## Upgrading to Verified

When an incident is upgraded from `trustworthiness: unverified` to `low`, `medium`, or `high`:

1. **Update the trustworthiness field** in frontmatter
2. **Remove the (UNVERIFIED) suffix** from the title
3. **Remove the italic plea for information** at the top
4. **Update the Editorial Assessment** to reflect the new rating
5. **If the incident has local media**, manually add its slug to `docs/data/media-order.md`

⚠️ **Important:** The `generate_summary.py` script excludes unverified incidents from media-order.md. When upgrading, you must **manually add the slug** to media-order.md or the video won't appear in the media gallery.

## What NOT to Include

- Speculation like "this could represent (1)... (2)... (3)..."
- Statements about why we're publishing despite being unverified
- Commentary on the significance if the claim were true
- Multiple paragraphs of analysis

## Example

**Good:**
```markdown
## Editorial Assessment
**UNVERIFIED** - Screenshot identified as Sullivan Elementary in Minneapolis. No news coverage or date confirmation found.
```

**Bad:**
```markdown
## Editorial Assessment
**UNVERIFIED** - This could represent: (1) a legitimate warning, (2) unverified rumors, or (3) a fabricated screenshot. We are publishing this as unverified because the claim - if true - would represent a significant tactic worth documenting.
```
