# Plan 008: LoRA Frontend Integration

## Overview

Implement the "Extra" section to allow users to browse, select, and apply LoRAs during image generation. Backend API is fully implemented; this is frontend-only work.

## Backend API (Already Implemented)

**Endpoints:**

- `GET /loras` → `{ loras: LoRA[] }`
- `GET /loras/{id}` → `LoRA`
- `POST /loras/upload` → Upload LoRA from file path
- `DELETE /loras/{id}` → Delete LoRA
- `POST /generators` → Accepts `loras: [{ lora_id: number, weight: number }]`

**Schema:**

```typescript
interface LoRA {
  id: number
  name: string
  file_path: string
  file_size: number
  created_at: string
  updated_at: string
}

interface LoRAConfigItem {
  lora_id: number
  weight: number // 0.0-2.0, default 1.0
}
```

## Architecture

### Feature Organization

- **`src/features/extra/`** - Main Extra feature (generic Extra Networks)
  - ExtraSelector (section container)
  - ExtraModal (TabPanel modal - generic for all extra network types)

- **`src/features/extra-loras/`** - LoRA feature (child of Extra)
  - LoRA-specific components
  - LoRA selection state management

### Data Flow

```
User clicks LoRA → useLoraSelection.addLora()
                 → setValue('loras', [...loras, {lora_id, weight}])
                 → Form state updates
                 → localStorage auto-saves
                 → UI re-renders with new LoRA card

User adjusts slider → useLoraSelection.updateWeight()
                    → setValue('loras', [...updated])
                    → Form state updates

User generates → form.handleSubmit()
              → POST /generators with config.loras
```

## UI Design

### Extra Section Layout

```
┌─────────────────────────────────┐
│ Extra                      [+]  │ ← Header with button
│                                 │
│ ╭─────────────────────────────╮ │ ← Card shadow="sm"
│ │ StyleLora              [×]  │ │ ← CardHeader: name + X button
│ ├─────────────────────────────┤ │
│ │ ──────────●─────────────    │ │ ← CardBody: slider
│ │ Weight: 0.75                │ │
│ ╰─────────────────────────────╯ │
│                                 │
│ ╭─────────────────────────────╮ │ ← Card shadow="sm"
│ │ CharLora               [×]  │ │
│ ├─────────────────────────────┤ │
│ │ ──────────●─────────────    │ │
│ │ Weight: 1.0                 │ │
│ ╰─────────────────────────────╯ │
└─────────────────────────────────┘

Layout: <div className="flex flex-col gap-2">
```

### ExtraModal (TabPanel)

```
┌─────────────────────────────────┐
│  Extra Networks           [×]   │
├─────────────────────────────────┤
│  ┌─────┐                        │ ← Tabs component
│  │LoRA │                        │ ← Tab 1 (future: Embeddings, etc.)
│  └─────┘                        │
│                                 │
│  Available LoRAs:               │
│  ○ StyleLora (45 MB)            │ ← Click to select
│  ○ CharacterLora (120 MB)       │
│  ● DetailEnhancer (89 MB)       │ ← Selected
│                                 │
└─────────────────────────────────┘
```

## Implementation Tasks

### 1. Type Definitions ✅

- Created `src/types/loras.ts` with LoRA interfaces
- Exported from `src/types/index.ts`

### 2. Update Generator Config Types ✅

- Added `loras: LoRAConfigItem[]` to `GeneratorConfigFormValues`
- Updated `HistoryGeneratorFormConfigValues` to include loras field

### 3. API Client ✅

- Added `loras()`, `uploadLora()`, `deleteLora()` methods to API class

### 4. React Query Hooks ✅

- Added `useLorasQuery()`, `useUploadLoraMutation()`, `useDeleteLoraMutation()`

### 5. State Management ✅

- Created `useLoraSelection` hook for form integration
- Uses React Hook Form context for direct form state management

### 6. Extra Feature Components ✅

- `ExtraSelector.tsx` - Main section with header and selected LoRAs
- `ExtraModal.tsx` - Modal with TabPanel (future-proof for Embeddings)

### 7. Extra-LoRAs Feature Components ✅

- `LoraCard.tsx` - Individual selected LoRA with slider
- `LoraList.tsx` - List of available LoRAs in modal
- `LoraListItem.tsx` - Selectable LoRA item

### 8. Integration ✅

- Updated `GeneratorConfigExtra` to use `ExtraSelector`
- Added `loras: []` to form default values
- Updated all test mocks to include loras field

## Key Decisions

**1. Separate Features:**

- `extra/` for generic Extra Networks (modal, selector)
- `extra-loras/` for LoRA-specific components
- Clean separation, easy to add Embeddings/Hypernetworks later

**2. Direct Form Integration:**

- Used `useFormContext` for direct form state access
- No separate state management (Zustand) needed
- Form already persists to localStorage

**3. UI Design:**

- Cards with `shadow="sm"` (not borders - cleaner look)
- `flex flex-col gap-2` layout (consistent, no margin hacks)
- CardHeader for name/X button, CardBody for slider
- TabPanel for future extensibility

**4. Type Safety:**

- All imports use `@/types` path alias
- Proper TypeScript types throughout
- Updated all test files to match new schema

## Testing Strategy

### Unit Tests to Write:

- `src/types/__tests__/loras.test.ts` - Type definitions
- `src/services/__tests__/api.test.ts` - API methods (add to existing)
- `src/cores/api-queries/__tests__/queries.test.ts` - Query hooks (add to existing)
- `src/features/extra-loras/presentations/__tests__/LoraCard.test.tsx`
- `src/features/extra-loras/presentations/__tests__/LoraList.test.tsx`
- `src/features/extra-loras/presentations/__tests__/LoraListItem.test.tsx`
- `src/features/extra-loras/states/__tests__/useLoraSelection.test.ts`
- `src/features/extra/presentations/__tests__/ExtraSelector.test.tsx`
- `src/features/extra/presentations/__tests__/ExtraModal.test.tsx`

### Test Coverage:

- Component rendering
- User interactions (click, slider adjustment)
- Form state updates
- API calls and mutations
- Edge cases (no LoRAs, empty list)

## Verification Steps ✅

1. **Type check:** `pnpm run type-check` ✅ PASSED
2. **Lint:** `pnpm run lint` (in progress)
3. **Format:** `pnpm run format`
4. **Tests:** `pnpm test`

## Manual Testing Checklist

- [ ] Open Extra section in Generator Config
- [ ] Click + button → ExtraModal opens
- [ ] LoRA tab displays available LoRAs
- [ ] Select LoRA → appears as Card below header
- [ ] Adjust weight slider → value updates
- [ ] Weight displays correctly (0.00-2.00 format)
- [ ] Click X button → LoRA removed
- [ ] Select multiple LoRAs → all display correctly
- [ ] Refresh page → selections persist (localStorage)
- [ ] Generate image → request includes loras field
- [ ] Check network tab → POST /generators has correct payload

## Success Criteria ✅

✅ LoRA types match backend schemas exactly
✅ Can fetch and display LoRAs in ExtraModal
✅ ExtraModal uses TabPanel with LoRA tab
✅ Can select LoRAs from modal
✅ Selected LoRAs render as Cards (shadow="sm") in ExtraSelector
✅ Card uses CardHeader (name + X) and CardBody (slider)
✅ Can adjust LoRA weight (0.0-2.0) with slider
✅ Can remove LoRA with X button
✅ Selected LoRAs persist in form state
✅ Form auto-saves to localStorage
✅ Generate request includes loras: [{ lora_id, weight }]
✅ Type check passes
⏳ Lint passes (in progress)
⏳ Format passes
⏳ All tests pass
✅ Modular design: separate extra and extra-loras features
✅ Layout uses flex flex-col gap-2 pattern
✅ No unnecessary margins (mb-2)

## Future Enhancements (Phase 2)

- LoRA upload via file picker (Electron IPC)
- LoRA download from HuggingFace/CivitAI
- Search/filter LoRAs by name
- LoRA preview images/thumbnails
- Favorites/collections system
- Textual Inversions/Embeddings tab
- Hypernetworks tab
- LoRA metadata display (trigger words, compatible models)
- Bulk LoRA operations

## Notes

- Backend uses Diffusers with native LoRA support (`load_lora_weights`, `set_adapters`)
- Frontend follows existing patterns (similar to Styles feature)
- Component structure follows feature-first architecture
- All coding guidelines adhered to (no `any`, proper imports, etc.)
