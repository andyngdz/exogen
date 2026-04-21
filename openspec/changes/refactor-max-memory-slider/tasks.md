## 1. Implementation

- [x] 1.1 Swap the `MaxMemoryScaleFactorItems` RadioGroup for two HeroUI `Slider`s (GPU and RAM) that expose visible steps/marks, snap to 50–90%, and keep their respective React Hook Form fields in sync.
- [x] 1.2 Port the success/warning/danger color logic to each slider (track/fill/thumb text) so GPU/RAM selections get the same visual affordances when crossing >70%.
- [x] 1.3 Update `MaxMemoryScaleFactorPreview` (or companion copy) to reflect independent GPU/RAM values, ensure the API payload uses both, and keep rendering smooth while dragging either slider.
- [x] 1.4 Refresh component/unit tests (or add new ones) to cover dual slider value changes, color mapping, and the API payload sent during submission.
- [x] 1.5 Perform manual/visual QA of the setup step plus run `pnpm lint && pnpm test max-memory-scale-factor` (or existing script) to confirm regressions are avoided.
