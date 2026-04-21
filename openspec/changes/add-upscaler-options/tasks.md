# Tasks

## 1. Extend useConfig hook

- [x] Add `upscalerOptions` computed by flattening all section options
- [x] Update `ConfigResult` interface

## 2. Update useGeneratorConfigHiresFixUpscaler

- [x] Use `upscalerOptions` from `useConfig`
- [x] Replace flatMap logic with `upscalerOptions.find()`

## 3. Update useGeneratorConfigFormats

- [x] Use `upscalerOptions` from `useConfig`
- [x] Replace `upscalers[0].options` with `upscalerOptions[0]`

## 4. Update tests

- [x] Update useConfig tests for `upscalerOptions`
- [x] Update useGeneratorConfigHiresFixUpscaler tests
- [x] Update useGeneratorConfigFormats tests
- [x] Update GeneratorConfigHiresFixUpscaler presentation tests
