# Incident Tarball

A compressed archive of all incident markdown files is generated on every commit and served at `/mn-ice-witness-all-incidents.tar.gz`. The download link is on the About page.

## How It Works

The pre-commit hook runs `scripts/generate-tarball.sh`, which:

1. Creates a gzip-compressed tar of `docs/incidents/`
2. Excludes the `_no_add` directory
3. Outputs to `docs/mn-ice-witness-all-incidents.tar.gz`
4. Stages the tarball for commit

## Manual Generation

```bash
./scripts/generate-tarball.sh
```

## Notes

- Uses standard gzip compression (compatible with macOS Archive Utility and Windows built-in extractor)
- The tarball is regenerated on every commit, so it always reflects the current set of incidents
- The `_no_add` folder is excluded — it contains rejected/draft files not shown on the site
