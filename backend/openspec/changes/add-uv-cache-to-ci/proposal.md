# Change: Add uv caching and update CI action versions

## Why

CI builds are slow due to dependency installation and outdated action versions. This change:
1. Enables uv caching following [official CI recommendations](https://docs.astral.sh/uv/concepts/cache/#caching-in-continuous-integration)
2. Updates all GitHub Actions to their latest major versions for security patches and performance improvements

## What Changes

### Caching (build.yml)
- Enable explicit uv cache via `enable-cache: true`
- Add `uv cache prune --ci` step after tests to optimize cache size

### Action Version Updates

**build.yml:**
| Action | Current | Updated |
|--------|---------|---------|
| `actions/checkout` | v4 | v6 |
| `actions/setup-python` | v5 | v6 |
| `astral-sh/setup-uv` | v5 | v7 |
| `actions/upload-artifact` | v4 | v5 |
| `actions/download-artifact` | v4 | v6 |
| `SonarSource/sonarcloud-github-action` | v2 | v5 |

**release.yml:**
| Action | Current | Updated |
|--------|---------|---------|
| `actions/checkout` | v4 | v6 |
| `pnpm/action-setup` | v4 | v4 (already latest) |
| `actions/setup-node` | v4 | v6 |

## Impact

- Affected specs: None (no specs for CI workflows)
- Affected code: `.github/workflows/build.yml`, `.github/workflows/release.yml`
- Expected improvement: Faster CI builds, latest security patches, better compatibility
