# Change: Default Styles

## Why

New users should get better generation quality out of the box with sensible default styles applied automatically.

## What Changes

- Apply default styles (`fooocus_masterpiece`, `fooocus_negative`) on first visit
- Only apply when styles array is empty
- Persist "applied" status in localStorage
- Respect user's manual clearing (don't re-apply)
- Skip missing styles silently

## Impact

- Affected specs: default-styles
- Affected code: Styles initialization logic, localStorage handling
