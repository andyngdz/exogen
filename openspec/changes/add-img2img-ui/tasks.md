# Tasks: Add Img2Img UI

## 1. Types and API

- [x] 1.1 Add `GeneratorMode` enum (`TEXT_2_IMAGE`, `IMAGE_2_IMAGE`)
- [x] 1.2 Add `Image2ImageResizeMode` enum (`resize`, `crop`)
- [x] 1.3 Add `GeneratorImage2ImageConfigFormValues` (extends base config with `init_image`, `strength`, `resize_mode`)
- [x] 1.4 Add `api.img2img()` method (`POST /img2img`) and request type

## 2. State Stores

- [x] 2.1 Add `useGeneratorModeStore` for mode selection (set/read)
- [x] 2.2 Add `useImage2ImageConfigStore` for `init_image` (base64), `strength`, `resize_mode` (ephemeral)

## 3. Hooks

- [x] 3.1 Add `useImage2ImageGenerator` hook (calls add history + `POST /img2img`)
- [x] 3.2 Keep `useGenerator` responsibility as txt2img-only

## 4. Middle Panel UI

- [x] 4.1 Extract shared prompt UI into `PromptInputs` component
- [x] 4.2 Implement `ModeTabs` component that renders:
  - Text-to-Image panel: existing prompt + action + previewer flow
  - Image-to-Image panel: image input zone + prompt + img2img action + previewer flow
- [x] 4.3 Implement `ImageInput` (drop/click/paste + preview + remove)

## 5. Left Panel (Config) Integration

- [x] 5.1 Add `GeneratorConfigImg2Img` section (strength slider + resize_mode selector)
- [x] 5.2 Hide/disable Hires.fix section while in Img2Img mode

## 6. Tests

- [x] 6.1 Unit tests for `ModeTabs` (renders both modes, switches modes)
- [x] 6.2 Unit tests for `ImageInput` (sets/clears image in store)
- [x] 6.3 Unit tests for `useImage2ImageGenerator` (calls `api.img2img` with expected payload)

## 7. Validation

- [x] 7.1 Run `pnpm run lint`
- [x] 7.2 Run `pnpm run type-check`
- [x] 7.3 Run `pnpm test`
