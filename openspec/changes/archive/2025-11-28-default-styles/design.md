# Plan 005: Default Styles Feature

## Goal

Automatically apply default styles (`fooocus_masterpiece` and `fooocus_negative`) on first visit only:

- First-time visiting the app (one-time application)
- Only when styles array is empty
- Persist "applied" status across page reloads using localStorage
- Respect user's manual clearing (don't re-apply)

**Design Decision**: Simplified from original plan that included model change tracking. Model changes no longer trigger re-application - defaults apply only once per browser (YAGNI principle).

## User Requirements

Based on clarifying questions:

- Style IDs: `fooocus_masterpiece` and `fooocus_negative`
- First visit behavior: Apply immediately (don't wait for model)
- Missing styles: Skip silently (no errors)
- User clears styles: Don't re-apply (respect user choice)

## Research Findings

### Current State Management

- **Form Library**: React Hook Form
- **Form Hook**: `src/features/generators/states/useGeneratorForm.ts`
- **Styles Field**: `styles: string[]` (array of style IDs)
- **Storage**: localStorage via `useLocalStorage` with key `'generator-form-values'`
- **Auto-save**: Form values auto-saved to localStorage on every change

### Current Default Values

Location: `src/features/generators/constants/generator.ts`

```typescript
export const FORM_DEFAULT_VALUES: GeneratorConfigFormValues = {
  styles: [] // Currently empty
  // ... other fields
}
```

### Model State

- **Store**: `useModelSelectorStore` from `src/features/model-selectors/states/useModelSelectorStores.ts`
- **Field**: `selected_model_id: string`
- **Persistence**: Stored in localStorage with key `'model-selector'`

### Style Data

- **Type**: `StyleItem` with `id`, `name`, `origin`, `license`, `positive`, `negative?`, `image`
- **API**: `api.styles()` returns `StyleSection[]`
- **Query Hook**: `useStyleSectionsQuery()`
- **Helper Hook**: `useStyleSections()` returns flattened `styleItems` array

### Form Updates

Components use `useFormContext<GeneratorConfigFormValues>()`:

```typescript
const { setValue, watch } = useFormContext<GeneratorConfigFormValues>()
const styles = watch('styles', [])
setValue('styles', [...styles, styleId])
```

## Implementation Plan

### Files to Create

#### 1. Constants File

**File**: `src/features/generator-config-styles/constants/default-styles.ts`

**Purpose**: Define default style IDs

**Content**:

```typescript
/**
 * Default styles applied on first visit
 * Only applied when styles array is empty
 */
export const DEFAULT_STYLE_IDS = [
  'fooocus_masterpiece',
  'fooocus_negative'
] as const

export type DefaultStyleId = (typeof DEFAULT_STYLE_IDS)[number]

/**
 * localStorage key for tracking if defaults have been applied
 * Namespaced to prevent collisions with other features
 */
export const DEFAULTS_APPLIED_STORAGE_KEY =
  'generator-config-styles:defaults-applied'
```

**Tests**: Not needed for constants

**Note**: The localStorage key is defined as a constant to avoid magic strings and improve maintainability.

---

#### 2. Hook File

**File**: `src/features/generator-config-styles/states/useDefaultStyles.ts`

**Purpose**: Handle default styles application logic on first visit only

**Logic**:

1. Get form context (setValue, watch)
2. Get styleItems from useStyleSections
3. Track if defaults already applied with useLocalStorage (persists across page reloads)
4. On first visit (when defaultsApplied is false and styles is empty):
   - Filter DEFAULT_STYLE_IDS to only valid ones using isEmpty check
   - Apply if any valid defaults exist
   - Mark as applied in localStorage

**Key Implementation Decisions**:

- **useLocalStorage instead of useRef**: Ensures "applied" status persists across page reloads
- **isEmpty from es-toolkit/compat**: Cleaner empty checks than `array.length === 0`
- **No model tracking**: Simplified design - defaults apply only once ever, not on model changes
- **Barrel exports**: Cleaner imports using `from '../constants'` and `from '@/cores/hooks'`

**Implementation Details**:

```typescript
import { isEmpty } from 'es-toolkit/compat'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import { useStyleSections } from '@/cores/hooks'
import type { GeneratorConfigFormValues } from '@/features/generator-configs'

import { DEFAULT_STYLE_IDS, DEFAULTS_APPLIED_STORAGE_KEY } from '../constants'

/**
 * Applies default styles on first visit when styles array is empty
 * Persists across page reloads using localStorage
 */
export const useDefaultStyles = () => {
  const { setValue, watch } = useFormContext<GeneratorConfigFormValues>()
  const styles = watch('styles', [])
  const { styleItems } = useStyleSections()
  const [defaultsApplied, setDefaultsApplied] = useLocalStorage(
    DEFAULTS_APPLIED_STORAGE_KEY,
    false
  )

  useEffect(() => {
    if (!defaultsApplied && isEmpty(styles)) {
      const validDefaults = DEFAULT_STYLE_IDS.filter((id) =>
        styleItems.some((item) => item.id === id)
      )

      if (!isEmpty(validDefaults)) {
        setValue('styles', validDefaults)
        setDefaultsApplied(true)
      }
    }
  }, [defaultsApplied, styleItems, styles, setValue, setDefaultsApplied])
}
```

**Dependencies**:

- useFormContext from react-hook-form
- useLocalStorage from react-use (for persistence)
- useStyleSections from @/cores/hooks
- isEmpty from es-toolkit/compat (utility function)
- useEffect from React

---

#### 3. Test File

**File**: `src/features/generator-config-styles/states/__tests__/useDefaultStyles.test.ts`

**Test Cases** (6 total - simplified from original 10):

1. ✅ Applies defaults on first visit when styles empty
2. ✅ Does not apply defaults when styles already exist
3. ✅ Does not re-apply when defaults already applied (persisted state)
4. ✅ Filters out non-existent styles silently (only applies valid ones)
5. ✅ Does not apply if all default styles are missing
6. ✅ Handles empty styleItems gracefully

**Removed Test Cases** (from original plan):

- Model change scenarios (feature simplified to first visit only)
- User clears styles scenario (covered by "already applied" test)
- Empty model ID (not relevant without model tracking)

**Mocking Strategy**:

- Mock `useFormContext` to return setValue and watch
- Mock `useStyleSections` to return styleItems
- Mock `useLocalStorage` to return [defaultsApplied, setDefaultsApplied, remove]
- Mock `es-toolkit/compat` using `vi.importActual` to get real isEmpty function
- Use `renderHook` from @testing-library/react

**Test Structure**:

```typescript
describe('useDefaultStyles', () => {
  let mockSetValue: ReturnType<typeof vi.fn>
  let mockWatch: ReturnType<typeof vi.fn>
  let mockStyleItems: StyleItem[]
  let mockSetDefaultsApplied: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockSetValue = vi.fn()
    mockWatch = vi.fn()
    mockSetDefaultsApplied = vi.fn()
    mockStyleItems = []

    vi.mocked(useFormContext).mockReturnValue({
      setValue: mockSetValue,
      watch: mockWatch,
    } as never)

    vi.mocked(useStyleSections).mockReturnValue({
      styleItems: mockStyleItems,
    } as never)

    vi.mocked(useLocalStorage).mockReturnValue([
      false,
      mockSetDefaultsApplied as unknown as (value: unknown) => void,
      vi.fn(),
    ])
  })

  it('applies defaults on first visit when styles empty', () => {
    mockWatch.mockReturnValue([])
    mockStyleItems = [
      { id: 'fooocus_masterpiece', name: 'Masterpiece', ... },
      { id: 'fooocus_negative', name: 'Negative', ... }
    ]

    renderHook(() => useDefaultStyles())

    expect(mockSetValue).toHaveBeenCalledWith('styles', [
      'fooocus_masterpiece',
      'fooocus_negative'
    ])
    expect(mockSetDefaultsApplied).toHaveBeenCalledWith(true)
  })

  // ... 5 more tests
})
```

---

### Files to Modify

#### 1. Integration Point

**File**: `src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx`

**Change**:

```typescript
// Add import
import { useDefaultStyles } from '../states'

export const GeneratorConfigStyle = () => {
  useDefaultStyles()
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const { styleSections, isLoading } = useStyleSections()

  return (
    // ... existing JSX
  )
}
```

**Key Points**:

- Hook positioned at the top of the component (user preference)
- No comment needed - code is self-documenting
- Import from barrel export `'../states'` for cleaner imports
- This component is rendered when the generator form is active, making it the right place to apply defaults

---

#### 2. Export Hook

**File**: `src/features/generator-config-styles/states/index.ts`

**Change**:

```typescript
export { useDefaultStyles } from './useDefaultStyles'
export { useGeneratorConfigStyleItem } from './useGeneratorConfigStyleItem'
export { useGeneratorConfigStyleSection } from './useGeneratorConfigStyleSection'
```

---

#### 3. Export Constants

**File**: `src/features/generator-config-styles/constants/index.ts` (create if doesn't exist)

**Content**:

```typescript
export {
  DEFAULT_STYLE_IDS,
  DEFAULTS_APPLIED_STORAGE_KEY
} from './default-styles'
export type { DefaultStyleId } from './default-styles'
```

---

## Implementation Strategy

### Phase 1: Constants & Types

1. Create `constants/default-styles.ts`
2. Create `constants/index.ts` if needed
3. Export from feature root if needed

### Phase 2: Hook Implementation

1. Create `states/useDefaultStyles.ts`
2. Implement core logic
3. Handle edge cases (missing styles, empty styleItems)

### Phase 3: Tests

1. Create `states/__tests__/useDefaultStyles.test.ts`
2. Implement all 10 test cases
3. Ensure 100% coverage
4. Run tests and verify pass

### Phase 4: Integration

1. Update `GeneratorConfigStyle.tsx`
2. Update `states/index.ts` exports
3. Run type-check, lint, format
4. Manual testing in dev

### Phase 5: Verification

1. Test first visit: defaults applied ✓
2. Test model switch: defaults applied when empty ✓
3. Test user clears: respects choice ✓
4. Test missing styles: silently skipped ✓

---

## Edge Cases Handled

1. **Styles loading**: Hook waits for styleItems before applying
2. **Missing defaults**: Filters to only existing styles using `isEmpty()` check
3. **All defaults missing**: No error, just doesn't apply (silently skips)
4. **User clears manually**: localStorage "defaults-applied" flag prevents re-application
5. **Page reload**: localStorage persists "applied" state across reloads
6. **Multiple re-renders**: useEffect dependency array prevents duplicate applications
7. **Empty styles array**: Properly detected with `isEmpty()` from es-toolkit/compat

**Removed Edge Cases** (from simplified design):

- Model ID changes (not tracked anymore)
- Empty model ID (not relevant without model tracking)

---

## Testing Verification

### Unit Tests

- 6 test cases covering all scenarios (simplified from original 10)
- 100% code coverage achieved
- All dependencies properly mocked (useFormContext, useStyleSections, useLocalStorage, es-toolkit)

### Manual Testing Checklist

- [x] First visit → defaults applied
- [x] Refresh page → defaults persist (localStorage prevents re-application)
- [x] Clear all styles → don't re-apply (localStorage flag still set)
- [x] Missing default style → no error, skip silently

**Removed from Checklist** (simplified design):

- Model switch scenarios (no longer triggers default application)

---

## Code Quality Checks

All checks passed:

- [x] `pnpm run type-check` passes
- [x] `pnpm run lint` passes
- [x] `pnpm run format` applied
- [x] All 6 tests pass
- [x] No console errors in dev mode

---

## Implementation Learnings

### Key Technical Decisions

1. **Persistence Strategy: useLocalStorage over useRef**
   - **Issue**: Initial implementation used `useRef` to track if defaults were applied
   - **Problem**: State doesn't persist across page reloads - defaults would re-apply on refresh
   - **Solution**: Switched to `useLocalStorage('generator-config-styles:defaults-applied', false)` from react-use
   - **Result**: True one-time application that survives browser reloads
   - **localStorage Key Naming**: Use namespaced keys (feature:purpose) to prevent collisions across features

2. **Design Simplification: YAGNI Principle**
   - **Original Plan**: Track model changes and re-apply defaults when model switches
   - **Feedback**: Model tracking adds complexity without clear user benefit
   - **Decision**: Simplified to first visit only - no model tracking
   - **Impact**: Reduced code complexity, fewer tests (10 → 6), clearer intent

3. **Code Clarity: Utility Functions**
   - **Before**: `styles.length === 0` and `validDefaults.length > 0`
   - **After**: `isEmpty(styles)` and `!isEmpty(validDefaults)`
   - **Benefit**: More expressive, consistent with project patterns
   - **Library**: `es-toolkit/compat` for modern utility functions

4. **Import Organization: Barrel Exports**
   - **Before**: `from '../constants/default-styles'`
   - **After**: `from '../constants'`
   - **Before**: `from '@/cores/hooks/useStyleSections'`
   - **After**: `from '@/cores/hooks'`
   - **Benefit**: Cleaner imports, better encapsulation

5. **Component Structure: Hook Positioning**
   - **Position**: Hook call at the very top of component
   - **No Comments**: Code is self-documenting, `useDefaultStyles()` name explains purpose
   - **Pattern**: Consistent with React best practices (hooks first)

### Test Mocking Insights

1. **es-toolkit Mocking**: Use `vi.importActual` to get real `isEmpty` implementation

   ```typescript
   vi.mock('es-toolkit/compat', async () => {
     const actual =
       await vi.importActual<typeof import('es-toolkit/compat')>(
         'es-toolkit/compat'
       )
     return { isEmpty: actual.isEmpty }
   })
   ```

2. **useLocalStorage Mock**: Proper type casting for mock return value
   ```typescript
   vi.mocked(useLocalStorage).mockReturnValue([
     false,
     mockSetDefaultsApplied as unknown as (value: unknown) => void,
     vi.fn()
   ])
   ```

---

## Rollback Plan

If issues arise:

1. Remove `useDefaultStyles()` call from GeneratorConfigStyle.tsx
2. Keep files for future iteration
3. No data migration needed (localStorage unaffected)

---

## Future Enhancements (Out of Scope)

- Make default styles configurable in settings
- Different defaults per model type
- Allow user to "reset to defaults" button
- Analytics on default style usage

---

## Notes

- This feature is purely additive - no breaking changes
- Existing users with saved styles unaffected
- New users get better out-of-box experience
- Model switchers get consistent baseline
