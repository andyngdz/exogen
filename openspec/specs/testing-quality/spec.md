# Testing Quality

## Purpose

Ensure automated tests run without warnings, use stable React Testing Library patterns, and surface legitimate regressions clearly.

## Requirements

### Requirement: Warning-Free Test Runs

The system SHALL keep `pnpm test` output free of runtime warnings (React act notices, DOM errors, noisy console logs).

#### Scenario: CI test run

- **WHEN** `pnpm test` runs locally or in CI
- **THEN** Vitest completes without any warning output on stderr
- **AND** intentional console errors are silenced via spies

### Requirement: RTL Interaction Discipline

The system SHALL use React Testing Library helpers to wrap stateful interactions and asynchronous updates.

#### Scenario: User interaction in tests

- **WHEN** a test triggers UI state updates
- **THEN** the interaction is wrapped in `act`, `fireEvent`, or `userEvent`
- **AND** assertions wait for settled state via `waitFor`/`findBy`

### Requirement: UI Component Compatibility

The system SHALL ensure component tests render HTML structures that match browser constraints.

#### Scenario: HeroUI Select usage

- **WHEN** a HeroUI `Select` renders within tests
- **THEN** option children do not include invalid HTML (e.g., `<span>` inside `<option>`)
- **AND** each select item has an explicit value or primitive child
