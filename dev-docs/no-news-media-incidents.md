# No-News-Media Incidents Procedure

When an incident has `trustworthiness: no-news-media`, follow these guidelines:

## Display Behavior

No-news-media incidents are **hidden from the main page** (both media gallery and list view). They only appear on the dedicated `/no-news-media` page, sorted by update date. This separation:
- Keeps the main site focused on incidents with news coverage
- Provides a dedicated space for readers who want to help find press coverage
- Prevents incidents without news coverage from being mixed with those that have it

## Required Elements

### 1. Brief Note + Request for Sources (Top of Body)
Immediately after the title, include a brief message asking for news coverage:

**Use this exact language:**

```markdown
# Title (NO NEWS MEDIA)

***Documented by social media posts. If you know of press coverage, please [contact us](mailto:mnicewitness@gmail.com).***
```


### 2. State Only Facts We Know
- Document only what can be directly observed or confirmed
- No speculation about what the incident "could represent"
- No editorializing about significance or implications
- No hypothetical scenarios

## Upgrading to News-Covered

When an incident is upgraded from `trustworthiness: no-news-media` to `low`, `medium`, or `high`:

1. **Update the trustworthiness field** in frontmatter
2. **Remove the (NO NEWS MEDIA) suffix** from the title
3. **Remove the italic plea for information** at the top
4. **If the incident has local media**, manually add its slug to `docs/data/media-order.md`

⚠️ **Important:** The `generate_summary.py` script excludes no-news-media incidents from media-order.md. When upgrading, you must **manually add the slug** to media-order.md or the video won't appear in the media gallery.

## What NOT to Include

- Speculation like "this could represent (1)... (2)... (3)..."
- Statements about why we're publishing despite lacking news coverage
- Commentary on the significance if the claim were true
- Multiple paragraphs of analysis

