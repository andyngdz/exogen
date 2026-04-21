# Change: Refactor Max Memory selection into dual sliders

## Why

The Max Memory setup step currently lists five discrete radio options, which makes the screen feel crowded and forces GPU/RAM to share the same percentage even though the backend stores two separate scale factors. HeroUI already ships a Slider component with visible steps that better conveys "pick any point along this track". Moving to two synchronized sliders (one for GPU, one for RAM) improves ergonomics, exposes the independent controls users already expect, and keeps the UI visually consistent with other HeroUI controls.

## What Changes

- Replace the multi-card RadioGroup with two HeroUI Sliders (GPU & RAM) configured with `showSteps`, `step=0.1`, and labeled marks for 50–90%.
- Mirror the existing color semantics (success/warning/danger) by tinting each slider track/fill or thumb when users cross the 70% threshold.
- Keep the current preview panel, but ensure its copy updates live based on both sliders so users can see asymmetric selections (e.g., 90% GPU, 70% RAM).
- Preserve React Hook Form integration so `gpuScaleFactor` and `ramScaleFactor` stay in sync with form submission and validation.
- Update component/unit tests to capture the dual-slider behavior.

## Impact

- Affected specs: `setup-max-memory` (new capability describing the slider interactions).
- Affected code: `src/features/max-memory-scale-factor/*` (UI + service), potential supporting hooks/tests.
