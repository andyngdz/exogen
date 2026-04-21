# Change: Styles Search

## Why

Users need to quickly find styles in large style libraries by searching through names, categories, and keywords.

## What Changes

- Add search input to styles modal
- Filter styles by name (case-insensitive)
- Filter styles by category/section ID
- Filter styles by positive/negative prompt keywords
- Debounce search queries (300ms)
- Display empty state when no results
- Hide sections with no matching styles

## Impact

- Affected specs: styles-search
- Affected code: Styles modal search component, filtering logic
