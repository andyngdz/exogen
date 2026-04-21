## 1. Create Memory Scale Factor Folder

- [x] 1.1 Create `src/cores/presentations/memory-scale-factor/` directory
- [x] 1.2 Create `src/cores/presentations/memory-scale-factor/index.ts` for exports

## 2. Refactor MaxMemoryScaleFactorItem

- [x] 2.1 Add props interface: `value`, `onChange`, `fieldName`, `label`, `description`
- [x] 2.2 Remove `useFormContext` and `Controller` dependencies
- [x] 2.3 Move to `src/cores/presentations/memory-scale-factor/MemoryScaleFactorItem.tsx`
- [x] 2.4 Update tests to use props-based API
- [x] 2.5 Export from folder index

## 3. Refactor MaxMemoryScaleFactorItems

- [x] 3.1 Add props interface: `gpuScaleFactor`, `ramScaleFactor`, `onGpuChange`, `onRamChange`
- [x] 3.2 Pass props to child `MemoryScaleFactorItem` components
- [x] 3.3 Move to `src/cores/presentations/memory-scale-factor/MemoryScaleFactorItems.tsx`
- [x] 3.4 Update tests to use props-based API
- [x] 3.5 Export from folder index

## 4. Refactor MaxMemoryScaleFactorPreview

- [x] 4.1 Add props interface: `gpuScaleFactor`, `ramScaleFactor`
- [x] 4.2 Remove `useFormContext` and `useWatch` dependencies
- [x] 4.3 Move to `src/cores/presentations/memory-scale-factor/MemoryScaleFactorPreview.tsx`
- [x] 4.4 Update tests to use props-based API
- [x] 4.5 Export from folder index

## 5. Export from Cores Presentations

- [x] 5.1 Re-export memory-scale-factor from `src/cores/presentations/index.ts`

## 6. Update Setup Flow Container

- [x] 6.1 Update `MaxMemoryScaleFactor` to import from `@/cores/presentations/memory-scale-factor`
- [x] 6.2 Pass form values and handlers as props to refactored components
- [x] 6.3 Verify setup flow still works correctly

## 7. Create Settings Container

- [x] 7.1 Create `useSettingsMemory` hook with form state, read values via `useConfig()`, and sync via `api.setMaxMemory()`
- [x] 7.2 Create `SettingsMemoryConfig` container component (Memory tab)
- [x] 7.3 Ensure `SettingsMemoryConfig` is rendered in `MemorySettings.tsx` (dedicated Memory tab)
- [x] 7.4 Add tests for settings memory configuration

## 8. Cleanup

- [x] 8.1 Remove old component files from `src/features/max-memory-scale-factor/presentations/`
- [x] 8.2 Update feature index exports
- [x] 8.3 Run full test suite to verify no regressions
