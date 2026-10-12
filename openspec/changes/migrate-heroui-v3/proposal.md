# Proposal: Migrate HeroUI v2 To v3

## Change ID

`migrate-heroui-v3`

## Summary

Move the frontend from HeroUI 2.8.6 to HeroUI 3.2.6 in one pull request, keeping every screen's layout and behavior. The upcoming redesign in Claude Design targets v3 components, so the framework moves first and the redesign builds on it.

## Why

- The approved redesign (Claude Design project "ExoGen", direction 1b) is specified against HeroUI v3 components and tokens.
- Building the redesign on v2 and upgrading later would rewrite the same screens twice.
- v2 needs a provider and a Tailwind plugin (`src/app/hero.ts`); v3 is CSS-first and ships without either, which removes one layer from the app root.

## What Changes

- Swap `@heroui/react` 2.8.6 for 3.2.6, add `@heroui/styles` and the v3 peer dependencies, and remove `@heroui/theme`, `@heroui/system`, and `@heroui/use-disclosure`.
- Delete `src/app/hero.ts`, drop `HeroUIProvider`, and load `@heroui/styles` from `src/app/globals.css`, carrying the current dark theme values into v3 CSS variables and painting the page background from `<body>`.
- Rewrite every v2 component usage in 105 source files to the v3 API, including compound components (Modal, Card, Select, Tabs, Tooltip, Slider, Drawer, Table, Dropdown, Accordion, Switch, Checkbox, Avatar, Alert, Badge, Breadcrumbs, ProgressBar, NumberField), props that moved or disappeared (`classNames`, `startContent`, `isLoading`, pressable cards), and the new `toast` functions.
- Replace the three components v3 removed (`Navbar`, `Snippet`, `Image`).
- Replace v2 color and size utility classes with v3 tokens in 61 files.
- Update the 64 test files that mock or render `@heroui/react` components to the v3 component shapes.

## Non-Goals

- The 1b redesign, the icon rail, the 3-step onboarding, and moving Settings and Logs into their own views. Those land in later changes.
- Restyling components beyond v3 defaults. Radius, spacing, and variants follow v3.
- Upgrading Next.js, React, Tailwind, or any dependency not required by HeroUI v3.

## Impact

- Affected code: all of `src/` that imports `@heroui/react`, plus `src/app/globals.css`, `src/app/layout.tsx`, `src/app/providers.tsx`, `src/app/hero.ts`, and `package.json`.
- Affected tests: 64 files under `src/**/__tests__` that mock or render `@heroui/react` components.
- New OpenSpec capability: `ui-framework`; modified capability: `testing-quality`.

## Risks / Mitigations

- **Repo does not build mid-migration**: accepted by the user when choosing the single-pass approach. The branch only merges once type-check, lint, tests, and build all pass.
- **Visual drift from v3 defaults**: accepted; layout parity is checked screen by screen against baseline screenshots taken on `main` before the swap.
- **Behavior regressions hidden by rewritten mocks**: mocks change shape only; test assertions about behavior stay as they are.
