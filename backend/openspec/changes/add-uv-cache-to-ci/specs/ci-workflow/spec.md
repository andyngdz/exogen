## ADDED Requirements

### Requirement: UV Dependency Caching

The CI workflow SHALL cache uv package dependencies to speed up subsequent workflow runs, following uv's official CI caching recommendations.

#### Scenario: Cache enabled with pruning

- **WHEN** the CI workflow runs
- **THEN** `setup-uv` action has `enable-cache: true` configured
- **AND** `uv cache prune --ci` runs after tests to minimize cache size

#### Scenario: Cache miss on first run

- **WHEN** a workflow runs for the first time with a new `uv.lock`
- **THEN** dependencies are downloaded and source-built wheels are cached

#### Scenario: Cache hit on subsequent runs

- **WHEN** a workflow runs with an unchanged `uv.lock`
- **THEN** cached source-built wheels are restored
- **AND** pre-built wheels are re-downloaded (faster than restoring from cache per uv docs)

### Requirement: Latest Action Versions

All GitHub Actions in CI workflows SHALL use their latest major versions for security and performance.

#### Scenario: build.yml actions are current

- **WHEN** inspecting build.yml
- **THEN** `actions/checkout` uses v6
- **AND** `actions/setup-python` uses v6
- **AND** `astral-sh/setup-uv` uses v7
- **AND** `actions/upload-artifact` uses v5
- **AND** `actions/download-artifact` uses v6
- **AND** `SonarSource/sonarcloud-github-action` uses v5

#### Scenario: release.yml actions are current

- **WHEN** inspecting release.yml
- **THEN** `actions/checkout` uses v6
- **AND** `actions/setup-node` uses v6
