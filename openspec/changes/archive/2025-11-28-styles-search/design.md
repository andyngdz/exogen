# Implementation Plan: Add Search Functionality to Styles Modal

## Overview

Add search functionality to the generator config styles modal, allowing users to filter styles by name, category, and prompt keywords.

## Research Summary

- **Data Structure**: `StyleSection[]` containing `StyleItem[]` with searchable fields: name, origin, positive/negative prompts
- **Current Implementation**: Virtualized rendering with @tanstack/react-virtual
- **HeroUI Input**: Has built-in `isClearable` prop and `onClear` callback - no need for custom endContent
- **Utility**: Use `isEmpty` from `es-toolkit/compat` (already in project)

## Key Design Decisions

### 1. Conditional Rendering Pattern

- **Preference**: Explicit `if/return` statements over ternary operators
- **Rationale**: Better readability when scanning code, especially in `useMemo` hooks
- **Example**:
  ```typescript
  const content = useMemo(() => {
    if (isEmptyState) {
      return <GeneratorConfigStyleEmptyState query={query} />
    }
    return <GeneratorConfigStyleSection styleSections={filteredSections} />
  }, [isEmptyState, query, filteredSections])
  ```

### 2. Logic Separation

- **Principle**: Separate business logic from UI rendering
- **Implementation**: Extract conditional checks into named variables
- **Example**: `const isEmptyState = !hasResults && !isEmpty(query)` before use in JSX

### 3. Performance Optimization with useMemo

- **Purpose**: Prevent unnecessary re-renders of expensive components
- **Pattern**: Wrap conditional component rendering in `useMemo`
- **Benefit**: Components only re-render when dependencies actually change

### 4. es-toolkit Best Practices

- **isEmpty Check**: Single `isEmpty()` call is sufficient - handles all falsy values
- **Type Consistency**: Use empty string `''` instead of `undefined` for initial state
- **Redundant Checks**: Avoid `!value || isEmpty(value)` - `isEmpty` already handles falsy values

## Implementation Steps

### 1. Create Search Hook (`src/features/generator-config-styles/states/useGeneratorConfigStyleSearch.ts`)

- Accept `styleSections: StyleSection[]` parameter
- Use `useState('')` for query string - empty string default (not undefined)
- Use `useDebounce(query, 300)` from `@uidotdev/usehooks`
- Use `useMemo` to filter sections:
  - Check `isEmpty(queryDebounced)` - single check (no redundant `!queryDebounced ||`)
  - Filter by: `style.name`, `section.id`, `style.positive`, `style.negative`
  - Case-insensitive matching with `.toLowerCase().includes()`
  - Remove sections with no matching styles using `isEmpty(section.styles)`
- Return: `{ query: string, setQuery, filteredSections, hasResults: !isEmpty(filteredSections) }`
  - Note: `query` is non-optional string (not `query?: string`)

### 2. Create Search Input Component (`src/features/generator-config-styles/presentations/GeneratorConfigStyleSearchInput.tsx`)

- Use HeroUI `Input` component with `isClearable` prop
- Props: `value: string`, `onChange: (value: string) => void`, `onClear: () => void`
- Configuration:
  - `variant="bordered"`
  - `placeholder="Search styles by name, category, or keywords..."`
  - `startContent={<Search size={18} />}` (lucide-react icon)
  - `isClearable={!isEmpty(value)}`
  - `onClear={onClear}`

### 3. Create Empty State Component (`src/features/generator-config-styles/presentations/GeneratorConfigStyleEmptyState.tsx`)

- Display when `isEmpty(filteredSections) && !isEmpty(query)`
- Centered layout with icon and text
- Message: `No styles found matching "${query}"`
- Subtext: "Try different keywords or browse all styles"

### 4. Modify Modal (`src/features/generator-config-styles/presentations/GeneratorConfigStyleModal.tsx`)

- Import and use search hook: `const { query, setQuery, filteredSections, hasResults } = useGeneratorConfigStyleSearch(styleSections)`
- Extract logic: `const isEmptyState = !hasResults && !isEmpty(query)`
- Use `useMemo` for conditional rendering:
  ```typescript
  const content = useMemo(() => {
    if (isEmptyState) {
      return <GeneratorConfigStyleEmptyState query={query} />
    }
    return <GeneratorConfigStyleSection styleSections={filteredSections} />
  }, [isEmptyState, query, filteredSections])
  ```
- Add separate filter row between ModalHeader and ModalBody
- Render `GeneratorConfigStyleSearchInput` with props
- Render `{content}` in ModalBody

### 5. Update Barrel Exports

- Add to `src/features/generator-config-styles/states/index.ts`
- Add to `src/features/generator-config-styles/index.ts`

### 6. Write Tests

- `__tests__/useGeneratorConfigStyleSearch.test.ts`: Test filtering, debouncing, empty results
- `__tests__/GeneratorConfigStyleSearchInput.test.tsx`: Test rendering, onChange, onClear
- `__tests__/GeneratorConfigStyleEmptyState.test.tsx`: Test empty state
- Update `__tests__/GeneratorConfigStyleModal.test.tsx`: Test integrated search

### 7. Verification

- Run: `pnpm run type-check && pnpm run lint && pnpm run format && pnpm test`
- Manual test: Open modal, search, test clear button
