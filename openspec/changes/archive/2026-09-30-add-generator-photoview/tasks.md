# Tasks: Add Generator Photoview

## 1. OpenSpec

- [x] 1.1 Add `generator-photoview` delta spec
- [x] 1.2 Add `img2img-ui` delta spec for "Use as input"

## 2. State

- [x] 2.1 Add `useGeneratorPhotoviewStore` (open/close + current index)

## 3. UI

- [x] 3.1 Add `GeneratorPhotoviewModal` (HeroUI Modal)
- [x] 3.2 Add `GeneratorPhotoviewCarousel` (Swiper + loop + initial slide)
- [x] 3.3 Render current image with `object-contain` on dark backdrop
- [x] 3.4 Add actions: Download + Use as Image-to-Image input

## 4. Integration

- [x] 4.1 Make generated preview tiles clickable in Grid and Slider view
- [x] 4.2 Ensure tile download button does not trigger photoview open
- [x] 4.3 Mount `GeneratorPhotoviewModal` on generator page

## 5. Tests

- [x] 5.1 Unit tests for `useGeneratorPhotoviewStore`
- [x] 5.2 Component tests for photoview open/close and actions

## 6. Validation

- [x] 6.1 Run `pnpm run type-check`
- [x] 6.2 Run `pnpm test`
