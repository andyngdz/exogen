# Release

## Purpose

Semantic versioning and automated release process using Conventional Commits.

## Requirements

### Requirement: Commit Analysis

The system SHALL analyze commits using the Conventional Commits format to determine release type.

#### Scenario: Feature commit triggers minor bump

- **WHEN** a `feat:` commit is pushed to main
- **THEN** a minor version bump occurs (x.Y.z)

#### Scenario: Fix commit triggers patch bump

- **WHEN** a `fix:` commit is pushed to main
- **THEN** a patch version bump occurs (x.y.Z)

#### Scenario: Breaking change triggers major bump

- **WHEN** a commit with `BREAKING CHANGE:` is pushed
- **THEN** a major version bump occurs (X.y.z)

### Requirement: Automatic Version Bump

The system SHALL determine version bump (major/minor/patch) automatically based on commit types.

#### Scenario: No version bump for non-release commits

- **WHEN** `docs`, `test`, `style`, or `chore` commits are pushed
- **THEN** no version bump occurs

### Requirement: Changelog Generation

The system SHALL generate categorized release notes from commits.

#### Scenario: Categorized release notes

- **WHEN** a release is created
- **THEN** the changelog groups commits by type (Features, Bug Fixes, etc.)

### Requirement: GitHub Release Creation

The system SHALL create GitHub releases with platform artifacts.

#### Scenario: Release with artifacts

- **WHEN** a release is created
- **THEN** GitHub release includes Windows, macOS, and Linux artifacts

### Requirement: Branch Strategy

The system SHALL support `main` (stable) and `develop` (beta) release branches.

#### Scenario: Beta releases from develop

- **WHEN** commits are pushed to develop branch
- **THEN** beta versions are released (x.y.z-beta.N)

#### Scenario: Stable releases from main

- **WHEN** commits are pushed to main branch
- **THEN** stable versions are released (x.y.z)

## Key Entities

- **Commit Types**: feat, fix, perf, refactor, revert, docs, test, style, chore, build, ci
- **Version Bump**: major (breaking), minor (feat), patch (fix/perf/refactor)
