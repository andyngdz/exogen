# Tasks

## 1. Create states folder structure

- [x] Create `src/features/generator-config-hires/states/` directory
- [x] Create `__tests__/` subfolder for tests

## 2. Create useGeneratorConfigHiresFixUpscaler hook

- [x] Extract `groupedUpscalers` memoization logic
- [x] Extract `onUpscalerChange` handler
- [x] Return `{ groupedUpscalers, onUpscalerChange }`
- [x] Hook internally uses `useConfig()` and `useFormContext()`

## 3. Create states/index.ts barrel file

- [x] Export hook from `states/index.ts`

## 4. Update presentation component

- [x] Import and use the new hook
- [x] Remove extracted logic from component
- [x] Keep only rendering logic

## 5. Add hook tests

- [x] Test `groupedUpscalers` correctly separates traditional and AI upscalers
- [x] Test `onUpscalerChange` sets correct denoise strength

## 6. Update feature index exports

- [x] N/A - Feature uses direct imports from subfolders (existing pattern)
