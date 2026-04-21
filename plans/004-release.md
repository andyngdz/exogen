# Release Process

This project uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate version management and package releases based on conventional commit messages.

## How It Works

When you push commits to the `main` branch, semantic-release automatically:

1. **Analyzes commits** since the last release using [Conventional Commits](https://www.conventionalcommits.org/)
2. **Determines the version bump** (major, minor, patch) based on commit types
3. **Generates release notes** from commit messages
4. **Creates a GitHub release** with release notes

## Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types

| Type       | Description                                    | Version Bump  | Appears in Changelog |
| ---------- | ---------------------------------------------- | ------------- | -------------------- |
| `feat`     | A new feature                                  | minor (0.x.0) | ✅ ✨ Features       |
| `fix`      | A bug fix                                      | patch (0.0.x) | ✅ 🐛 Bug Fixes      |
| `perf`     | Performance improvement                        | patch (0.0.x) | ✅ ⚡ Performance    |
| `refactor` | Code refactoring (no functional changes)       | patch (0.0.x) | ✅ ♻️ Refactoring    |
| `revert`   | Revert a previous commit                       | patch (0.0.x) | ✅ ⏪ Reverts        |
| `docs`     | Documentation changes                          | none          | ✅ 📚 Documentation  |
| `test`     | Adding or updating tests                       | none          | ❌                   |
| `style`    | Code style changes (formatting, whitespace)    | none          | ❌                   |
| `chore`    | Maintenance tasks (dependencies, build config) | none          | ❌                   |
| `build`    | Changes to build system or dependencies        | none          | ❌                   |
| `ci`       | CI/CD configuration changes                    | none          | ❌                   |

### Breaking Changes

To trigger a **major** version bump (x.0.0), add `BREAKING CHANGE:` in the commit footer or use `!` after the type/scope:

```bash
# Option 1: Footer
feat: redesign user interface

BREAKING CHANGE: The entire UI has been redesigned and is incompatible with previous versions.

# Option 2: ! after type
feat!: redesign user interface

The entire UI has been redesigned and is incompatible with previous versions.
```

### Examples

```bash
# Feature (minor version bump: 0.x.0)
feat(auth): add social login support

# Bug fix (patch version bump: 0.0.x)
fix(login): resolve session timeout issue

# Performance improvement (patch version bump: 0.0.x)
perf(api): optimize database queries

# Refactoring (patch version bump: 0.0.x)
refactor(hooks): simplify state management

# Documentation (no version bump)
docs: update installation guide

# Breaking change (major version bump: x.0.0)
feat(api)!: change authentication method

BREAKING CHANGE: Switched from JWT to OAuth2. Existing tokens are invalid.
```

### Skipping Releases

To prevent a commit from triggering a release:

```bash
# Add [skip ci] to the commit message
chore: update dependencies [skip ci]

# Or use the no-release scope
chore(no-release): update internal tooling
```

## Branches

- **`main`**: Production releases (e.g., `1.0.0`, `1.1.0`)
- **`develop`**: Beta/pre-releases (e.g., `1.1.0-beta.1`)

## Manual Release

To manually trigger a release (not recommended):

```bash
pnpm run semantic-release
```

**Note**: This requires the `GITHUB_TOKEN` environment variable to be set.

## CI/CD Workflow

The release workflow (`.github/workflows/release.yml`) runs automatically when:

1. Code is pushed to `main` or `develop` branches

**Note:** This workflow does NOT run tests or quality checks automatically. Make sure to run tests, linting, and type-checking before pushing to release branches, or use the Code Quality workflow for PRs.

## Workflow Steps

The release workflow performs these steps:

1. **Checkout**: Fetches full git history for semantic-release analysis
2. **Setup Node.js**: Installs Node.js (latest version) with pnpm cache
3. **Install Dependencies**: Runs `pnpm install --frozen-lockfile`
4. **Run Semantic Release**: Executes `pnpm exec semantic-release` to:
   - Analyze commits since last release
   - Determine version bump (major/minor/patch)
   - Generate changelog
   - Create GitHub release
   - Commit updated files back to repository

## Viewing Releases

All releases are available on GitHub:

- [Releases Page](https://github.com/andyngdz/localai/releases)
- The `CHANGELOG.md` file in the repository

## Configuration

Semantic-release is configured in `.releaserc.json`. Key settings:

- **Branches**: `main` for stable releases, `develop` for beta releases
- **Plugins**: Changelog generation, GitHub releases, Git commits
- **Release Assets**: Desktop application binaries (`.exe`, `.dmg`, `.AppImage`)

**Quality Checks**: Run separately via the Code Quality workflow (`.github/workflows/build.yml`) which executes on pull requests to ensure code quality before merging.

## Troubleshooting

### Release Not Created

1. **Check commit messages**: Ensure they follow the conventional format
2. **Verify branch**: Releases only happen on `main` and `develop`
3. **Check CI logs**: View the GitHub Actions workflow logs for errors
4. **Ensure tests pass**: Release only triggers if all checks succeed

### Version Not Updated

1. **Check commit types**: Only `feat`, `fix`, `perf`, `refactor`, and `revert` trigger releases
2. **Look for breaking changes**: Major bumps require `BREAKING CHANGE:` or `!`
3. **Verify no `[skip ci]`**: This prevents releases

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
