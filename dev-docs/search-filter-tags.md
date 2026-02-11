# Search Filter Tags

Tags are added to incident frontmatter via the `search_tags` field. They power the checkbox filters in the search modal. Tags do not display on the incident page itself.

## Frontmatter Format

```yaml
search_tags: children, pepper-spray, us-citizen, src:fox9, src:star-tribune
```

Comma-separated list. Topic tags are plain values; source tags use the `src:` prefix.

## Topic Tags

| Tag | Label | Use When |
|-----|-------|----------|
| `us-citizen` | U.S. Citizen | Affected person is a U.S. citizen |
| `legal-resident` | Legal Resident | Affected person has legal status (green card, visa, refugee authorization) |
| `citizen-check` | Citizen Check | Agents demanded ID or questioned citizenship status of someone lawfully present |
| `observer-intimidated` | Observer Intimidated | Bystander, protester, or clergy harassed, shoved, or sprayed for observing |
| `observer-detained` | Observer Detained | Observer or bystander held, arrested, or transported by agents |
| `children` | Children | Children present, affected, or separated from parents |
| `pepper-spray` | Pepper Spray | Pepper spray or pepper rounds used |
| `tear-gas` | Tear Gas | Tear gas, flashbangs, or chemical irritants deployed |
| `shooting` | Shooting | Firearm discharged by agents |
| `excessive-force` | Excessive Force | Force beyond what the situation warranted |
| `wrong-person` | Wrong Person | Wrong address, wrong individual, or mistaken identity |
| `journalist` | Journalist | Credentialed journalist targeted or harmed |

## Source Tags

| Tag | Label |
|-----|-------|
| `src:star-tribune` | Star Tribune |
| `src:bring-me-the-news` | Bring Me The News |
| `src:sahan-journal` | Sahan Journal |
| `src:fox9` | FOX 9 |
| `src:kare11` | KARE 11 |
| `src:cbs-mn` | CBS Minnesota |
| `src:mpr` | MPR News |
| `src:pioneer-press` | Pioneer Press |

## Filter Logic

- **Within Topics:** OR (matches if incident has ANY selected topic tag)
- **Within Sources:** OR (matches if incident has ANY selected source tag)
- **Between groups:** AND (must match at least one from each group when both have selections)
- **Text search** works alongside tag filters (results must match both)

## Adding New Tags

1. Add the tag value to this doc
2. Add a `<label class="filter-chip">` checkbox in `docs/index.html` inside the appropriate `.filter-group`
3. Start tagging incidents with the new value in their `search_tags` frontmatter

## Demo Incidents (tagged for testing)

These 7 incidents have `search_tags` for the initial demo:

- `2026-01-07-renee-good-shooting` — shooting, us-citizen, children
- `2026-01-14-shawn-jackson-children-tear-gas` — children, tear-gas, excessive-force
- `2026-01-13-ryan-ecklund-filming-detained` — observer-detained, us-citizen
- `2026-01-24-jana-shortal-journalist-pepper-sprayed` — journalist, pepper-spray, observer-intimidated
- `2026-01-12-nimco-omar-citizen-check` — citizen-check, us-citizen
- `2026-01-07-clergy-pepper-sprayed` — pepper-spray, observer-intimidated
- `2026-01-15-porter-wrong-address-raid` — wrong-person, us-citizen
