# Tasks: Migrate HeroUI v2 To v3

Single-pass migration (see `design.md`, Review Units). Sections 2 through 10 do not build on their own: the repo builds again only once every source and test section is done. Each section is still reviewed as a unit against the mapping tables in `design.md`. File lists come from parsing `@heroui/react` imports and v2 class names in `src/` on 2026-09-28; dependencies and `parallel-safe` come from file overlap between sections.

## 1. Baseline Screenshots [depends-on: -] [writes: -] [parallel-safe: no]

- [ ] Before installing anything, run the app from this branch (still identical to `main` in `src/`) with `pnpm run desktop`.
- [ ] Capture each screen listed in `design.md` Testing (health check, GPU detection, max memory, model recommendations, editor in text to image and image to image, history photoview, generator photoview, settings modal on every tab, extra/LoRA modal, styles modal, model search, backend logs drawer) into a local directory outside the repo.
- [x] Record the test file count from `pnpm test` for the parity check in section 11.

## 2. Packages And App Root [depends-on: 1] [writes: package.json, pnpm-lock.yaml, src/app/hero.ts, src/app/__tests__/hero.test.ts, src/app/globals.css, src/app/layout.tsx, src/app/providers.tsx] [parallel-safe: no]

- [x] `pnpm remove @heroui/theme @heroui/system @heroui/use-disclosure`.
- [x] `pnpm add @heroui/react@3.2.6 @heroui/styles@3.2.6` plus the peer dependencies listed in `design.md` Package Decision.
- [x] Delete `src/app/hero.ts` and its test `src/app/__tests__/hero.test.ts`.
- [x] Update `src/app/globals.css` per `design.md` Infrastructure: drop the hero plugin and `@heroui/theme` source, import `@heroui/styles` after `tailwindcss`, set `--accent` and `--background` under `.dark`, replace the five `--heroui-*` references.
- [x] Add `bg-background text-foreground` to `<body>` in `src/app/layout.tsx`.
- [x] In `src/app/providers.tsx`, remove `HeroUIProvider` and mount `<Toast.Provider />`.

## 3. Overlays: Modal And Drawer [depends-on: 2] [writes: src/features/backend-logs/presentations/BackendLog.tsx, src/features/extra/presentations/ExtraModal.tsx, src/features/extra/presentations/ExtraSelector.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleModal.tsx, src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx, src/features/histories/presentations/HistoryDeleteButton.tsx, src/features/histories/presentations/HistoryPhotoviewModal.tsx, src/features/model-search/presentations/ModelSearchOpenIconButton.tsx, src/features/settings/presentations/SettingsModal.tsx, src/features/settings/presentations/tabs/DeleteModelButton.tsx] [parallel-safe: yes]

- [x] Rewrite each modal to `Modal` > `Modal.Backdrop` > `Modal.Container` > `Modal.Dialog` with `Modal.CloseTrigger`, `Modal.Header`/`Modal.Heading`, `Modal.Body`, `Modal.Footer`.
- [x] Replace `useDisclosure` with `useOverlayState`, wiring `isOpen`/`onOpenChange` on `Modal.Backdrop`.
- [x] Move `scrollBehavior`, `placement`, `size`, and `backdrop` per `design.md` Props That Move Or Disappear, including the `2xl`/`5xl` size mapping.
- [x] Rewrite the backend logs drawer in `BackendLog.tsx` to the `Drawer` compound API.

Files:

- `src/features/backend-logs/presentations/BackendLog.tsx`
- `src/features/extra/presentations/ExtraModal.tsx`
- `src/features/extra/presentations/ExtraSelector.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleModal.tsx`
- `src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx`
- `src/features/histories/presentations/HistoryDeleteButton.tsx`
- `src/features/histories/presentations/HistoryPhotoviewModal.tsx`
- `src/features/model-search/presentations/ModelSearchOpenIconButton.tsx`
- `src/features/settings/presentations/SettingsModal.tsx`
- `src/features/settings/presentations/tabs/DeleteModelButton.tsx`

## 4. Cards And Pressable Cards [depends-on: 2] [writes: src/features/extra-loras/presentations/LoraCard.tsx, src/features/extra-loras/presentations/LoraListItem.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleSection.tsx, src/features/generator-image-input/presentations/ImageInputHeader.tsx, src/features/generator-previewers/presentations/GeneratorPreviewTile.tsx, src/features/gpu-detection/presentations/GpuDetectionItems.tsx, src/features/gpu-detection/presentations/GpuDetectionVersion.tsx, src/features/histories/presentations/HistoryItemContainer.tsx, src/features/model-recommendations/presentations/ModelRecommendationsCard.tsx, src/features/model-search/presentations/ModelSearchItem.tsx] [parallel-safe: yes]

- [x] Replace `CardHeader`/`CardBody`/`CardFooter` with `Card.Header`/`Card.Content`/`Card.Footer`; drop `shadow`.
- [x] In `LoraListItem`, `GeneratorPreviewTile`, `HistoryItemContainer`, `ModelSearchItem`, replace `isPressable`/`onPress` with `usePress` from `react-aria` spread on the `Card` root plus `role="button"` and `tabIndex={0}`; keep `GeneratorPreviewTile` non-interactive when it has no `onPress`.

Files:

- `src/features/extra-loras/presentations/LoraCard.tsx`
- `src/features/extra-loras/presentations/LoraListItem.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleSection.tsx`
- `src/features/generator-image-input/presentations/ImageInputHeader.tsx`
- `src/features/generator-previewers/presentations/GeneratorPreviewTile.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionItems.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionVersion.tsx`
- `src/features/histories/presentations/HistoryItemContainer.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsCard.tsx`
- `src/features/model-search/presentations/ModelSearchItem.tsx`

## 5. Toasts [depends-on: 2] [writes: src/features/extra-loras/presentations/useUploadLoraButton.ts, src/features/generator-image-input/states/useImageInputController.ts, src/features/generator-photoview/states/useGeneratorPhotoviewModalModel.ts, src/features/generator-previewers/states/useDownloadImages.ts, src/features/generators/states/useAddHistoryMutation.ts, src/features/generators/states/useGenerator.ts, src/features/generators/states/useImage2ImageGenerator.ts, src/features/histories/states/useDeleteHistory.ts, src/features/settings/states/useDeleteModel.ts, src/features/settings/states/useUpdaterSettings.ts] [parallel-safe: yes]

- [x] Replace each `addToast({ title, description, color })` with `toast.success`, `toast.danger`, or `toast.warning` by the same color, keeping title and description text.

Files:

- `src/features/extra-loras/presentations/useUploadLoraButton.ts`
- `src/features/generator-image-input/states/useImageInputController.ts`
- `src/features/generator-photoview/states/useGeneratorPhotoviewModalModel.ts`
- `src/features/generator-previewers/states/useDownloadImages.ts`
- `src/features/generators/states/useAddHistoryMutation.ts`
- `src/features/generators/states/useGenerator.ts`
- `src/features/generators/states/useImage2ImageGenerator.ts`
- `src/features/histories/states/useDeleteHistory.ts`
- `src/features/settings/states/useDeleteModel.ts`
- `src/features/settings/states/useUpdaterSettings.ts`

## 6. Form Controls [depends-on: 4] [writes: src/cores/presentations/NumberInputController.tsx, src/cores/presentations/memory-scale-factor/MemoryScaleFactorItem.tsx, src/cores/presentations/memory-scale-factor/MemoryScaleFactorItems.tsx, src/features/extra-loras/presentations/LoraCard.tsx, src/features/extra-loras/presentations/LoraListItem.tsx, src/features/generator-actions/presentations/GeneratorAction.tsx, src/features/generator-config-formats/presentations/GeneratorConfigFormat.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFix.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx, src/features/generator-config-img2img/presentations/GeneratorConfigImg2Img.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleSearchInput.tsx, src/features/generator-prompts/presentations/PromptInputs.tsx, src/features/gpu-detection/presentations/GpuDetectionItem.tsx, src/features/gpu-detection/presentations/GpuDetectionItems.tsx, src/features/max-memory-scale-factor/services/max-memory-scale-factor.ts, src/features/model-search/presentations/ModelSearchInput.tsx, src/features/settings/presentations/tabs/GeneralSettings.tsx, src/features/settings/states/useSettingsMemory.ts] [parallel-safe: no]

- [x] Select: compound `Select.Trigger`/`Select.Value`/`Select.Indicator`/`Select.Popover` with `ListBox.Item` (explicit `id`, `textValue` when children are not plain text); `selectedKeys`/`onSelectionChange` become `value`/`onChange`.
- [x] Slider: compound `Slider.Output`/`Track`/`Fill`/`Thumb`; replace `SliderValue` with `number | number[]`.
- [x] `NumberInputController`: move to `NumberField` compound, keep `startContent`/`endContent` as its own props rendered inside `NumberField.Group`, replace `NumberInputProps` with `NumberFieldProps`.
- [x] Input and Textarea: `TextField` with `Label` and `Input`/`TextArea`; adornments through `InputGroup.Prefix`/`Suffix`.
- [x] Switch, Checkbox, RadioGroup/Radio: v3 composition with `*.Content`/`*.Control` and label as plain text.

Files:

- `src/cores/presentations/NumberInputController.tsx`
- `src/cores/presentations/memory-scale-factor/MemoryScaleFactorItem.tsx`
- `src/cores/presentations/memory-scale-factor/MemoryScaleFactorItems.tsx`
- `src/features/extra-loras/presentations/LoraCard.tsx`
- `src/features/extra-loras/presentations/LoraListItem.tsx`
- `src/features/generator-actions/presentations/GeneratorAction.tsx`
- `src/features/generator-config-formats/presentations/GeneratorConfigFormat.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFix.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx`
- `src/features/generator-config-img2img/presentations/GeneratorConfigImg2Img.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleSearchInput.tsx`
- `src/features/generator-prompts/presentations/PromptInputs.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionItem.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionItems.tsx`
- `src/features/max-memory-scale-factor/services/max-memory-scale-factor.ts`
- `src/features/model-search/presentations/ModelSearchInput.tsx`
- `src/features/settings/presentations/tabs/GeneralSettings.tsx`
- `src/features/settings/states/useSettingsMemory.ts`

## 7a. Status And Identity Components [depends-on: 3, 6] [writes: src/cores/presentations/AuthorAvatar.tsx, src/features/generation-phase-stepper/presentations/GenerationPhaseStepper.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdownLoader.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleModal.tsx, src/features/generator-image-input/presentations/ImageInputHeader.tsx, src/features/generator-previewers/presentations/GeneratorImageRenderer.tsx, src/features/generators/presentations/Generator.tsx, src/features/health-check/presentations/BackendStatusItem.tsx, src/features/health-check/presentations/HealthStatusChip.tsx, src/features/histories/presentations/HistoryLoader.tsx, src/features/histories/presentations/HistoryPhotoviewConfigRow.tsx, src/features/model-download-status-line/presentations/ModelDownloadStatusLineIndicator.tsx, src/features/model-load-progress/presentations/ModelLoadProgressBar.tsx, src/features/model-recommendations/presentations/ModelRecommendationsTags.tsx, src/features/model-recommendations/services/model_tag.ts, src/features/model-search/presentations/ModelSearchListModel.tsx, src/features/model-search/presentations/ModelSearchViewCard.tsx, src/features/model-search/presentations/ModelSearchViewLoader.tsx, src/features/model-search/presentations/ModelSearchViewSpaces.tsx, src/features/model-selectors/presentations/ModelSelector.tsx, src/features/settings/presentations/tabs/ModelManagement.tsx] [parallel-safe: no]

- [x] Chip and Badge: explicit `variant` and v3 `color` per `design.md` Chip And Badge, including the values in `model_tag.ts`.
- [x] Avatar, Alert: compound members per `design.md`.
- [x] `Progress` becomes the `ProgressBar` compound with `Label`.
- [x] Breadcrumbs in `GenerationPhaseStepper`: `Breadcrumbs.Item` with the indicator as a child and the current-phase styling from `design.md`.
- [x] Skeleton, Spinner: keep, adjusting only props v3 does not accept.
- [x] Move `classNames` slots to `className` on the matching compound member.

Files:

- `src/cores/presentations/AuthorAvatar.tsx`
- `src/features/generation-phase-stepper/presentations/GenerationPhaseStepper.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdown.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdownLoader.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleModal.tsx`
- `src/features/generator-image-input/presentations/ImageInputHeader.tsx`
- `src/features/generator-previewers/presentations/GeneratorImageRenderer.tsx`
- `src/features/generators/presentations/Generator.tsx`
- `src/features/health-check/presentations/BackendStatusItem.tsx`
- `src/features/health-check/presentations/HealthStatusChip.tsx`
- `src/features/histories/presentations/HistoryLoader.tsx`
- `src/features/histories/presentations/HistoryPhotoviewConfigRow.tsx`
- `src/features/model-download-status-line/presentations/ModelDownloadStatusLineIndicator.tsx`
- `src/features/model-load-progress/presentations/ModelLoadProgressBar.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsTags.tsx`
- `src/features/model-recommendations/services/model_tag.ts`
- `src/features/model-search/presentations/ModelSearchListModel.tsx`
- `src/features/model-search/presentations/ModelSearchViewCard.tsx`
- `src/features/model-search/presentations/ModelSearchViewLoader.tsx`
- `src/features/model-search/presentations/ModelSearchViewSpaces.tsx`
- `src/features/model-selectors/presentations/ModelSelector.tsx`
- `src/features/settings/presentations/tabs/ModelManagement.tsx`

## 7b. Navigation And Collection Components [depends-on: 7a] [writes: src/features/backend-logs/presentations/BackendLogList.tsx, src/features/extra/presentations/ExtraModal.tsx, src/features/generator-config-quantities/presentations/GeneratorConfigQuantity.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleSection.tsx, src/features/generator-configs/presentations/GeneratorConfig.tsx, src/features/generator-modes/presentations/ModeTabs.tsx, src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx, src/features/generator-previewers/presentations/GeneratorPreviewerGrid.tsx, src/features/generator-previewers/presentations/GeneratorPreviewerSlider.tsx, src/features/gpu-detection/presentations/GpuDetectionVersion.tsx, src/features/health-check/presentations/BackendStatusList.tsx, src/features/health-check/presentations/SuggestedCommands.tsx, src/features/histories/presentations/Histories.tsx, src/features/histories/presentations/HistoryDeleteButton.tsx, src/features/histories/presentations/HistoryLoader.tsx, src/features/histories/presentations/HistoryUseConfigButton.tsx, src/features/max-memory-scale-factor/presentations/MaxMemoryScaleFactor.tsx, src/features/model-download-status-line/presentations/ModelDownloadStatusLine.tsx, src/features/model-search/presentations/ModelSearchListModel.tsx, src/features/model-search/presentations/ModelSearchOpenIconButton.tsx, src/features/model-search/presentations/ModelSearchView.tsx, src/features/model-search/presentations/ModelSearchViewCard.tsx, src/features/model-search/presentations/ModelSearchViewFiles.tsx, src/features/model-search/presentations/ModelSearchViewLoader.tsx, src/features/model-selectors/presentations/ModelSelector.tsx, src/features/settings/presentations/SettingsBase.tsx, src/features/settings/presentations/SettingsMemoryConfig.tsx, src/features/settings/presentations/SettingsModal.tsx, src/features/settings/presentations/tabs/ModelManagement.tsx] [parallel-safe: no]

- [x] Tabs, Tooltip, Table, Dropdown, Accordion: compound APIs per `design.md`.
- [x] `Listbox` becomes `ListBox`; in `ModelManagement`, render `DeleteModelButton` as a child of `ListBox.Item` with `textValue`.
- [x] `Divider` becomes `Separator`.
- [x] ScrollShadow: `hideScrollBar` becomes `className="scrollbar-none"`.
- [x] Move `classNames` slots to `className` on the matching compound member.

Files:

- `src/features/backend-logs/presentations/BackendLogList.tsx`
- `src/features/extra/presentations/ExtraModal.tsx`
- `src/features/generator-config-quantities/presentations/GeneratorConfigQuantity.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleSection.tsx`
- `src/features/generator-configs/presentations/GeneratorConfig.tsx`
- `src/features/generator-modes/presentations/ModeTabs.tsx`
- `src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx`
- `src/features/generator-previewers/presentations/GeneratorPreviewerGrid.tsx`
- `src/features/generator-previewers/presentations/GeneratorPreviewerSlider.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionVersion.tsx`
- `src/features/health-check/presentations/BackendStatusList.tsx`
- `src/features/health-check/presentations/SuggestedCommands.tsx`
- `src/features/histories/presentations/Histories.tsx`
- `src/features/histories/presentations/HistoryDeleteButton.tsx`
- `src/features/histories/presentations/HistoryLoader.tsx`
- `src/features/histories/presentations/HistoryUseConfigButton.tsx`
- `src/features/max-memory-scale-factor/presentations/MaxMemoryScaleFactor.tsx`
- `src/features/model-download-status-line/presentations/ModelDownloadStatusLine.tsx`
- `src/features/model-search/presentations/ModelSearchListModel.tsx`
- `src/features/model-search/presentations/ModelSearchOpenIconButton.tsx`
- `src/features/model-search/presentations/ModelSearchView.tsx`
- `src/features/model-search/presentations/ModelSearchViewCard.tsx`
- `src/features/model-search/presentations/ModelSearchViewFiles.tsx`
- `src/features/model-search/presentations/ModelSearchViewLoader.tsx`
- `src/features/model-selectors/presentations/ModelSelector.tsx`
- `src/features/settings/presentations/SettingsBase.tsx`
- `src/features/settings/presentations/SettingsMemoryConfig.tsx`
- `src/features/settings/presentations/SettingsModal.tsx`
- `src/features/settings/presentations/tabs/ModelManagement.tsx`

## 8a. Components Removed In v3 [depends-on: 7b] [writes: src/features/editors/presentations/EditorNavbar.tsx, src/features/generator-image-input/presentations/ImageInputBody.tsx, src/features/health-check/presentations/SuggestedCommands.tsx] [parallel-safe: yes]

- [x] `EditorNavbar.tsx`: replace `Navbar*` with a `<header>` keeping the three-slot row and bottom border.
- [x] `SuggestedCommands.tsx`: replace `Snippet` with `<code>` and a copy `Button`.
- [x] `ImageInputBody.tsx`: replace `Image` with `next/image`.

Files:

- `src/features/editors/presentations/EditorNavbar.tsx`
- `src/features/generator-image-input/presentations/ImageInputBody.tsx`
- `src/features/health-check/presentations/SuggestedCommands.tsx`

## 8b. Button Variants And Pending State [depends-on: 7b] [writes: src/cores/presentations/SwiperNavigationActions.tsx, src/features/backend-logs/presentations/BackendLog.tsx, src/features/extra-loras/presentations/LoraCard.tsx, src/features/extra-loras/presentations/UploadLoraButton.tsx, src/features/extra/presentations/ExtraSelector.tsx, src/features/generator-actions/presentations/GeneratorActionSubmitButton.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigCommonSteps.tsx, src/features/generator-config-seed/presentations/GeneratorConfigSeed.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx, src/features/generator-image-input/presentations/ImageInputTopRight.tsx, src/features/generator-image-input/presentations/ImageInputZone.tsx, src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx, src/features/generator-previewers/presentations/GeneratorImageDownloadButton.tsx, src/features/gpu-detection/presentations/GpuDetectionCpuModeOnly.tsx, src/features/histories/presentations/HistoryDeleteButton.tsx, src/features/histories/presentations/HistoryUseConfigButton.tsx, src/features/model-recommendations/presentations/ModelRecommendations.tsx, src/features/model-recommendations/presentations/ModelRecommendationsDownloadButton.tsx, src/features/model-search/presentations/ModelSearchOpenIconButton.tsx, src/features/model-search/presentations/ModelSearchViewDownloadButton.tsx, src/features/model-search/presentations/ModelSearchViewDownloadedButton.tsx, src/features/model-search/presentations/ModelSearchViewHeader.tsx, src/features/model-search/presentations/ModelSearchViewSpaces.tsx, src/features/model-selectors/presentations/ModelSelector.tsx, src/features/settings/presentations/SettingsButton.tsx, src/features/settings/presentations/tabs/DeleteModelButton.tsx, src/features/settings/presentations/tabs/UpdateSettings.tsx, src/features/setup-layout/presentations/SetupLayout.tsx] [parallel-safe: yes]

- [x] Give every `Button` an explicit v3 `variant` per `design.md` Button Variants; remove `color` and `radius`.
- [x] Replace `isLoading` with `isPending` on the 6 HeroUI Buttons listed in `design.md`; leave app-component `isLoading` props alone.
- [x] Move `startContent`/`endContent` icons on Buttons into children.

Files:

- `src/cores/presentations/SwiperNavigationActions.tsx`
- `src/features/backend-logs/presentations/BackendLog.tsx`
- `src/features/extra-loras/presentations/LoraCard.tsx`
- `src/features/extra-loras/presentations/UploadLoraButton.tsx`
- `src/features/extra/presentations/ExtraSelector.tsx`
- `src/features/generator-actions/presentations/GeneratorActionSubmitButton.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigCommonSteps.tsx`
- `src/features/generator-config-seed/presentations/GeneratorConfigSeed.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyle.tsx`
- `src/features/generator-image-input/presentations/ImageInputTopRight.tsx`
- `src/features/generator-image-input/presentations/ImageInputZone.tsx`
- `src/features/generator-photoview/presentations/GeneratorPhotoviewModal.tsx`
- `src/features/generator-previewers/presentations/GeneratorImageDownloadButton.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionCpuModeOnly.tsx`
- `src/features/histories/presentations/HistoryDeleteButton.tsx`
- `src/features/histories/presentations/HistoryUseConfigButton.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendations.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsDownloadButton.tsx`
- `src/features/model-search/presentations/ModelSearchOpenIconButton.tsx`
- `src/features/model-search/presentations/ModelSearchViewDownloadButton.tsx`
- `src/features/model-search/presentations/ModelSearchViewDownloadedButton.tsx`
- `src/features/model-search/presentations/ModelSearchViewHeader.tsx`
- `src/features/model-search/presentations/ModelSearchViewSpaces.tsx`
- `src/features/model-selectors/presentations/ModelSelector.tsx`
- `src/features/settings/presentations/SettingsButton.tsx`
- `src/features/settings/presentations/tabs/DeleteModelButton.tsx`
- `src/features/settings/presentations/tabs/UpdateSettings.tsx`
- `src/features/setup-layout/presentations/SetupLayout.tsx`

## 9. Utility Classes [depends-on: 8a, 8b] [writes: src/cores/presentations/FullScreenLoader.tsx, src/cores/presentations/memory-scale-factor/MemoryScaleFactorItem.tsx, src/cores/presentations/memory-scale-factor/MemoryScaleFactorPreview.tsx, src/features/app-footer/presentations/AppFooter.tsx, src/features/backend-logs/presentations/BackendLog.tsx, src/features/backend-logs/presentations/BackendLogItem.tsx, src/features/backend-logs/services/backend-logs.ts, src/features/extra-loras/presentations/LoraCard.tsx, src/features/extra-loras/presentations/LoraList.tsx, src/features/extra-loras/presentations/LoraListItem.tsx, src/features/generation-phase-stepper/presentations/GenerationPhaseIndicator.tsx, src/features/generation-phase-stepper/presentations/GenerationPhaseStepper.tsx, src/features/generator-actions/presentations/GeneratorActionSubmitButton.tsx, src/features/generator-config-formats/presentations/GeneratorConfigFormat.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFix.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx, src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx, src/features/generator-config-img2img/presentations/GeneratorConfigImg2Img.tsx, src/features/generator-config-quantities/presentations/GeneratorConfigQuantity.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigCommonSteps.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdownLoader.tsx, src/features/generator-config-sampling/presentations/GeneratorConfigSampling.tsx, src/features/generator-config-seed/presentations/GeneratorConfigSeed.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleEmptyState.tsx, src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx, src/features/generator-configs/presentations/GeneratorConfig.tsx, src/features/generator-image-input/presentations/ImageInput.tsx, src/features/generator-image-input/presentations/ImageInputBody.tsx, src/features/generator-image-input/presentations/ImageInputHeader.tsx, src/features/generator-modes/presentations/GeneratorModePanelLayout.tsx, src/features/generator-previewers/presentations/GeneratorPreviewerSlider.tsx, src/features/gpu-detection/presentations/GpuDetectionItem.tsx, src/features/gpu-detection/presentations/GpuDetectionVersion.tsx, src/features/health-check/presentations/BackendStatusItem.tsx, src/features/health-check/presentations/BackendStatusList.tsx, src/features/health-check/presentations/SuggestedCommands.tsx, src/features/histories/presentations/HistoryEmpty.tsx, src/features/histories/presentations/HistoryErrors.tsx, src/features/histories/presentations/HistoryItemContainer.tsx, src/features/histories/presentations/HistoryLoader.tsx, src/features/histories/presentations/HistoryPhotoviewCard.tsx, src/features/histories/presentations/HistoryPhotoviewCarousel.tsx, src/features/histories/presentations/HistoryPhotoviewConfigRow.tsx, src/features/histories/presentations/HistoryUseConfigButton.tsx, src/features/model-download-status-line/presentations/ModelDownloadStatusInfo.tsx, src/features/model-download-status-line/presentations/ModelDownloadStatusLineIndicator.tsx, src/features/model-load-progress/presentations/ModelLoadProgressBar.tsx, src/features/model-recommendations/presentations/ModelRecommendationsBadge.tsx, src/features/model-recommendations/presentations/ModelRecommendationsCard.tsx, src/features/model-recommendations/presentations/ModelRecommendationsDownloadButton.tsx, src/features/model-recommendations/presentations/ModelRecommendationsHeader.tsx, src/features/model-search/presentations/ModelSearchItem.tsx, src/features/model-search/presentations/ModelSearchListModel.tsx, src/features/model-search/presentations/ModelSearchViewCard.tsx, src/features/model-search/presentations/ModelSearchViewFooter.tsx, src/features/model-search/presentations/ModelSearchViewHeader.tsx, src/features/model-search/presentations/ModelSearchViewLoader.tsx, src/features/settings/presentations/SettingsBase.tsx, src/features/settings/presentations/SettingsButton.tsx, src/features/settings/presentations/SettingsModal.tsx, src/features/setup-layout/presentations/SetupLayoutContent.tsx] [parallel-safe: no]

- [x] Replace v2 color, size, and radius classes per `design.md` Utility Classes.
- [x] Confirm the leftover-class grep in `design.md` Testing returns nothing for source files.

Files:

- `src/cores/presentations/FullScreenLoader.tsx`
- `src/cores/presentations/memory-scale-factor/MemoryScaleFactorItem.tsx`
- `src/cores/presentations/memory-scale-factor/MemoryScaleFactorPreview.tsx`
- `src/features/app-footer/presentations/AppFooter.tsx`
- `src/features/backend-logs/presentations/BackendLog.tsx`
- `src/features/backend-logs/presentations/BackendLogItem.tsx`
- `src/features/backend-logs/services/backend-logs.ts`
- `src/features/extra-loras/presentations/LoraCard.tsx`
- `src/features/extra-loras/presentations/LoraList.tsx`
- `src/features/extra-loras/presentations/LoraListItem.tsx`
- `src/features/generation-phase-stepper/presentations/GenerationPhaseIndicator.tsx`
- `src/features/generation-phase-stepper/presentations/GenerationPhaseStepper.tsx`
- `src/features/generator-actions/presentations/GeneratorActionSubmitButton.tsx`
- `src/features/generator-config-formats/presentations/GeneratorConfigFormat.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFix.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaleFactor.tsx`
- `src/features/generator-config-hires/presentations/GeneratorConfigHiresFixUpscaler.tsx`
- `src/features/generator-config-img2img/presentations/GeneratorConfigImg2Img.tsx`
- `src/features/generator-config-quantities/presentations/GeneratorConfigQuantity.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigCommonSteps.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigSamplerDropdownLoader.tsx`
- `src/features/generator-config-sampling/presentations/GeneratorConfigSampling.tsx`
- `src/features/generator-config-seed/presentations/GeneratorConfigSeed.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleEmptyState.tsx`
- `src/features/generator-config-styles/presentations/GeneratorConfigStyleItem.tsx`
- `src/features/generator-configs/presentations/GeneratorConfig.tsx`
- `src/features/generator-image-input/presentations/ImageInput.tsx`
- `src/features/generator-image-input/presentations/ImageInputBody.tsx`
- `src/features/generator-image-input/presentations/ImageInputHeader.tsx`
- `src/features/generator-modes/presentations/GeneratorModePanelLayout.tsx`
- `src/features/generator-previewers/presentations/GeneratorPreviewerSlider.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionItem.tsx`
- `src/features/gpu-detection/presentations/GpuDetectionVersion.tsx`
- `src/features/health-check/presentations/BackendStatusItem.tsx`
- `src/features/health-check/presentations/BackendStatusList.tsx`
- `src/features/health-check/presentations/SuggestedCommands.tsx`
- `src/features/histories/presentations/HistoryEmpty.tsx`
- `src/features/histories/presentations/HistoryErrors.tsx`
- `src/features/histories/presentations/HistoryItemContainer.tsx`
- `src/features/histories/presentations/HistoryLoader.tsx`
- `src/features/histories/presentations/HistoryPhotoviewCard.tsx`
- `src/features/histories/presentations/HistoryPhotoviewCarousel.tsx`
- `src/features/histories/presentations/HistoryPhotoviewConfigRow.tsx`
- `src/features/histories/presentations/HistoryUseConfigButton.tsx`
- `src/features/model-download-status-line/presentations/ModelDownloadStatusInfo.tsx`
- `src/features/model-download-status-line/presentations/ModelDownloadStatusLineIndicator.tsx`
- `src/features/model-load-progress/presentations/ModelLoadProgressBar.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsBadge.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsCard.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsDownloadButton.tsx`
- `src/features/model-recommendations/presentations/ModelRecommendationsHeader.tsx`
- `src/features/model-search/presentations/ModelSearchItem.tsx`
- `src/features/model-search/presentations/ModelSearchListModel.tsx`
- `src/features/model-search/presentations/ModelSearchViewCard.tsx`
- `src/features/model-search/presentations/ModelSearchViewFooter.tsx`
- `src/features/model-search/presentations/ModelSearchViewHeader.tsx`
- `src/features/model-search/presentations/ModelSearchViewLoader.tsx`
- `src/features/settings/presentations/SettingsBase.tsx`
- `src/features/settings/presentations/SettingsButton.tsx`
- `src/features/settings/presentations/SettingsModal.tsx`
- `src/features/setup-layout/presentations/SetupLayoutContent.tsx`

## 10. Tests [depends-on: 9] [writes: src/app/__tests__/providers.test.tsx, src/cores/presentations/__tests__/AuthorAvatar.test.tsx, src/cores/presentations/__tests__/NumberInputController.test.tsx, src/cores/presentations/__tests__/SwiperNavigationActions.test.tsx, src/features/backend-logs/__tests__/backend-logs.test.ts, src/features/backend-logs/presentations/__tests__/BackendLog.test.tsx, src/features/editors/presentations/__tests__/EditorNavbar.test.tsx, src/features/extra-loras/presentations/__tests__/LoraListItem.test.tsx, src/features/extra-loras/presentations/__tests__/UploadLoraButton.test.tsx, src/features/extra-loras/presentations/__tests__/useUploadLoraButton.test.ts, src/features/generator-actions/presentations/__tests__/GeneratorAction.test.tsx, src/features/generator-actions/presentations/__tests__/GeneratorActionSubmitButton.test.tsx, src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFix.test.tsx, src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFixUpscaleFactor.test.tsx, src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFixUpscaler.test.tsx, src/features/generator-config-img2img/presentations/__tests__/GeneratorConfigImg2Img.test.tsx, src/features/generator-config-quantities/presentations/__tests__/GeneratorConfigQuantity.test.tsx, src/features/generator-config-sampling/presentations/__tests__/GeneratorConfigCommonSteps.test.tsx, src/features/generator-config-sampling/presentations/__tests__/GeneratorConfigSamplerDropdownLoader.test.tsx, src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleItem.test.tsx, src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleModal.test.tsx, src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleSearchInput.test.tsx, src/features/generator-configs/presentations/__tests__/GeneratorConfig.test.tsx, src/features/generator-image-input/presentations/__tests__/ImageInput.test.tsx, src/features/generator-image-input/presentations/__tests__/ImageInputHeader.test.tsx, src/features/generator-image-input/states/__tests__/useImageInput.test.ts, src/features/generator-modes/presentations/__tests__/ModeTabs.test.tsx, src/features/generator-photoview/presentations/__tests__/GeneratorPhotoviewModal.test.tsx, src/features/generator-previewers/presentations/__tests__/GeneratorPreviewerItem.test.tsx, src/features/generator-previewers/presentations/__tests__/GeneratorPreviewerSlider.test.tsx, src/features/generator-previewers/states/__tests__/useDownloadImages.test.ts, src/features/generator-prompts/presentations/__tests__/GeneratorPrompt.test.tsx, src/features/generators/presentations/__tests__/Generator.test.tsx, src/features/generators/states/__tests__/useGenerator.test.ts, src/features/generators/states/__tests__/useImage2ImageGenerator.test.ts, src/features/gpu-detection/presentations/__tests__/GpuDetectionItem.test.tsx, src/features/gpu-detection/presentations/__tests__/GpuDetectionVersion.test.tsx, src/features/health-check/presentations/__tests__/SuggestedCommands.test.tsx, src/features/histories/presentations/__tests__/Histories.test.tsx, src/features/histories/presentations/__tests__/HistoryDeleteButton.test.tsx, src/features/histories/presentations/__tests__/HistoryLoader.test.tsx, src/features/histories/presentations/__tests__/HistoryPhotoviewConfigRow.test.tsx, src/features/histories/presentations/__tests__/HistoryUseConfigButton.test.tsx, src/features/histories/states/__tests__/useDeleteHistory.test.ts, src/features/model-download-status-line/presentations/__tests__/ModelDownloadStatusLine.test.tsx, src/features/model-recommendations/presentations/__tests__/ModelRecommendations.test.tsx, src/features/model-recommendations/presentations/__tests__/ModelRecommendationsBadge.test.tsx, src/features/model-recommendations/presentations/__tests__/ModelRecommendationsCard.test.tsx, src/features/model-recommendations/presentations/__tests__/ModelRecommendationsDownloadButton.test.tsx, src/features/model-recommendations/presentations/__tests__/ModelRecommendationsHeader.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchInput.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchOpenIconButton.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchView.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewCard.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewDownloadButton.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewDownloadedButton.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewFiles.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewHeader.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewLoader.test.tsx, src/features/model-search/presentations/__tests__/ModelSearchViewSpaces.test.tsx, src/features/settings/presentations/__tests__/SettingsButton.test.tsx, src/features/settings/presentations/__tests__/SettingsMemoryConfig.test.tsx, src/features/settings/presentations/__tests__/SettingsModal.test.tsx, src/features/settings/presentations/tabs/__tests__/DeleteModelButton.test.tsx, src/features/settings/presentations/tabs/__tests__/GeneralSettings.test.tsx, src/features/settings/presentations/tabs/__tests__/ModelManagement.test.tsx, src/features/settings/presentations/tabs/__tests__/UpdateSettings.test.tsx, src/features/settings/states/__tests__/useDeleteModel.test.ts, src/features/settings/states/__tests__/useUpdaterSettings.test.ts] [parallel-safe: no]

- [x] Rewrite each `@heroui/react` mock (63 files) to export the v3 names and compound members the component under test uses.
- [x] Where a test asserts a v2 prop or class, change the expected value to the mapped v3 prop or class from `design.md`; keep behavior assertions unchanged.
- [x] Update the 6 tests that assert v2 class names without mocking HeroUI (`backend-logs.test.ts`, `GeneratorConfigCommonSteps.test.tsx`, `GpuDetectionVersion.test.tsx`, `HistoryPhotoviewConfigRow.test.tsx`, `ModelRecommendationsBadge.test.tsx`, `ModelRecommendationsHeader.test.tsx`).
- [x] `GpuDetectionItem.test.tsx` renders the real `RadioGroup`; adjust its queries to the v3 markup.

Files:

- `src/app/__tests__/providers.test.tsx`
- `src/cores/presentations/__tests__/AuthorAvatar.test.tsx`
- `src/cores/presentations/__tests__/NumberInputController.test.tsx`
- `src/cores/presentations/__tests__/SwiperNavigationActions.test.tsx`
- `src/features/backend-logs/__tests__/backend-logs.test.ts`
- `src/features/backend-logs/presentations/__tests__/BackendLog.test.tsx`
- `src/features/editors/presentations/__tests__/EditorNavbar.test.tsx`
- `src/features/extra-loras/presentations/__tests__/LoraListItem.test.tsx`
- `src/features/extra-loras/presentations/__tests__/UploadLoraButton.test.tsx`
- `src/features/extra-loras/presentations/__tests__/useUploadLoraButton.test.ts`
- `src/features/generator-actions/presentations/__tests__/GeneratorAction.test.tsx`
- `src/features/generator-actions/presentations/__tests__/GeneratorActionSubmitButton.test.tsx`
- `src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFix.test.tsx`
- `src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFixUpscaleFactor.test.tsx`
- `src/features/generator-config-hires/presentations/__tests__/GeneratorConfigHiresFixUpscaler.test.tsx`
- `src/features/generator-config-img2img/presentations/__tests__/GeneratorConfigImg2Img.test.tsx`
- `src/features/generator-config-quantities/presentations/__tests__/GeneratorConfigQuantity.test.tsx`
- `src/features/generator-config-sampling/presentations/__tests__/GeneratorConfigCommonSteps.test.tsx`
- `src/features/generator-config-sampling/presentations/__tests__/GeneratorConfigSamplerDropdownLoader.test.tsx`
- `src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleItem.test.tsx`
- `src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleModal.test.tsx`
- `src/features/generator-config-styles/presentations/__tests__/GeneratorConfigStyleSearchInput.test.tsx`
- `src/features/generator-configs/presentations/__tests__/GeneratorConfig.test.tsx`
- `src/features/generator-image-input/presentations/__tests__/ImageInput.test.tsx`
- `src/features/generator-image-input/presentations/__tests__/ImageInputHeader.test.tsx`
- `src/features/generator-image-input/states/__tests__/useImageInput.test.ts`
- `src/features/generator-modes/presentations/__tests__/ModeTabs.test.tsx`
- `src/features/generator-photoview/presentations/__tests__/GeneratorPhotoviewModal.test.tsx`
- `src/features/generator-previewers/presentations/__tests__/GeneratorPreviewerItem.test.tsx`
- `src/features/generator-previewers/presentations/__tests__/GeneratorPreviewerSlider.test.tsx`
- `src/features/generator-previewers/states/__tests__/useDownloadImages.test.ts`
- `src/features/generator-prompts/presentations/__tests__/GeneratorPrompt.test.tsx`
- `src/features/generators/presentations/__tests__/Generator.test.tsx`
- `src/features/generators/states/__tests__/useGenerator.test.ts`
- `src/features/generators/states/__tests__/useImage2ImageGenerator.test.ts`
- `src/features/gpu-detection/presentations/__tests__/GpuDetectionItem.test.tsx`
- `src/features/gpu-detection/presentations/__tests__/GpuDetectionVersion.test.tsx`
- `src/features/health-check/presentations/__tests__/SuggestedCommands.test.tsx`
- `src/features/histories/presentations/__tests__/Histories.test.tsx`
- `src/features/histories/presentations/__tests__/HistoryDeleteButton.test.tsx`
- `src/features/histories/presentations/__tests__/HistoryLoader.test.tsx`
- `src/features/histories/presentations/__tests__/HistoryPhotoviewConfigRow.test.tsx`
- `src/features/histories/presentations/__tests__/HistoryUseConfigButton.test.tsx`
- `src/features/histories/states/__tests__/useDeleteHistory.test.ts`
- `src/features/model-download-status-line/presentations/__tests__/ModelDownloadStatusLine.test.tsx`
- `src/features/model-recommendations/presentations/__tests__/ModelRecommendations.test.tsx`
- `src/features/model-recommendations/presentations/__tests__/ModelRecommendationsBadge.test.tsx`
- `src/features/model-recommendations/presentations/__tests__/ModelRecommendationsCard.test.tsx`
- `src/features/model-recommendations/presentations/__tests__/ModelRecommendationsDownloadButton.test.tsx`
- `src/features/model-recommendations/presentations/__tests__/ModelRecommendationsHeader.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchInput.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchOpenIconButton.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchView.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewCard.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewDownloadButton.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewDownloadedButton.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewFiles.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewHeader.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewLoader.test.tsx`
- `src/features/model-search/presentations/__tests__/ModelSearchViewSpaces.test.tsx`
- `src/features/settings/presentations/__tests__/SettingsButton.test.tsx`
- `src/features/settings/presentations/__tests__/SettingsMemoryConfig.test.tsx`
- `src/features/settings/presentations/__tests__/SettingsModal.test.tsx`
- `src/features/settings/presentations/tabs/__tests__/DeleteModelButton.test.tsx`
- `src/features/settings/presentations/tabs/__tests__/GeneralSettings.test.tsx`
- `src/features/settings/presentations/tabs/__tests__/ModelManagement.test.tsx`
- `src/features/settings/presentations/tabs/__tests__/UpdateSettings.test.tsx`
- `src/features/settings/states/__tests__/useDeleteModel.test.ts`
- `src/features/settings/states/__tests__/useUpdaterSettings.test.ts`

## 11. Verification [depends-on: 10] [writes: -] [parallel-safe: no]

- [x] `openspec validate migrate-heroui-v3 --strict` passes.
- [x] `pnpm run type-check` passes with zero errors.
- [x] `pnpm run lint` passes.
- [x] `pnpm test` passes with the section 1 test file count minus one (`hero.test.ts` is deleted with `hero.ts`).
- [ ] `pnpm build` passes; the compiled CSS has one preflight and no scrollbar utility collision.
- [x] The three greps in `design.md` Testing return nothing.
- [ ] Capture the section 1 screens again and compare with the baseline for layout and text hierarchy; check `<body>` computes `background-color` `#0b0c11` and `--accent` `#5048e5`.
- [ ] Run the passgate gates for the changed files (`passgate-engine changed`, then `heroui`, `frontend`, `typescript` on their scopes).
