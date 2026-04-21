# Tasks

## 1. Update types in api.ts

- Rename `Upscaler` to `UpscalerOption`
- Add `UpscalerSection` interface: `{ method, title, options: UpscalerOption[] }`
- Update `BackendConfig.upscalers` to `UpscalerSection[]`

## 2. Update useConfig hook

- Update default to `{ upscalers: [] }` (array of sections)

## 3. Update useGeneratorConfigHiresFixUpscaler hook

- Rename `groupedUpscalers` to `upscalerSections` (directly from config)
- Update `onUpscalerChange` to find option across all sections using flatMap

## 4. Update presentation component

- Replace hardcoded `SelectSection` blocks with dynamic mapping
- Map over `upscalerSections`, render `SelectSection` for each
- Show divider between sections (except last)

## 5. Update all tests

- Update mock data to new section structure
- Update hook tests
- Update component tests
- Update useConfig tests
- Update useGeneratorConfigFormats tests
