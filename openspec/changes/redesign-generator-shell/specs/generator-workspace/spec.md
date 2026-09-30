## ADDED Requirements

### Requirement: Canvas-First Generator Layout

The generator SHALL render a top bar, a preview stage, a floating prompt dock over the stage, and a 300px inspector on the right, replacing the three-pane layout.

#### Scenario: Generator layout

- **WHEN** the user opens `/editor` with a model loaded
- **THEN** the top bar shows the model selector, the Text to image and Image to image switch, and the Single and Grid switch
- **AND** the inspector shows the Basic, Hires, LoRA and Styles tabs
- **AND** the prompt dock floats at the bottom of the stage

### Requirement: Prompt Dock

The dock SHALL hold the prompt, an optional negative prompt, summary pills for the current settings, and the generate action.

#### Scenario: Negative prompt toggle

- **WHEN** the negative prompt is empty and the user presses "Negative prompt"
- **THEN** a second text area for the negative prompt appears under the prompt

#### Scenario: Negative prompt already set

- **WHEN** the form's `negative_prompt` is not empty
- **THEN** the negative prompt text area is visible without pressing the toggle

#### Scenario: Keyboard submit

- **WHEN** the prompt has focus and the user presses Ctrl+Enter while generation can start
- **THEN** generation starts with the current form values

#### Scenario: Generation cannot start

- **WHEN** the backend is offline, a model is loading, no model is selected, or image mode has no input image
- **THEN** the generate button is disabled and Ctrl+Enter does nothing
- **AND** the first matching reason, in the order "Backend offline", "Waiting for the model", "Select a model", "Add an input image", shows above the button

### Requirement: Size Presets Per Model Family

The Basic tab SHALL offer 1:1, 4:3, 3:4, 16:9 and Custom sizes, where each preset keeps the base pixel count of the loaded model family rounded to multiples of 64.

#### Scenario: Preset for an SDXL model

- **WHEN** an SDXL model is loaded and the user picks 4:3
- **THEN** the form's width is 1152 and height is 896

#### Scenario: Preset for an SD 1.5 model

- **WHEN** an SD 1.5 model is loaded and the user picks 1:1
- **THEN** the form's width and height are 512

#### Scenario: Custom stays selected

- **WHEN** the user picks Custom while the size is 1152 by 896 on an SDXL model, then presses swap
- **THEN** the size is 896 by 1152 and Custom stays selected with the width and height fields visible

#### Scenario: Model reload passes through an unknown family

- **WHEN** an SDXL model at the 1:1 preset is reloaded, so the family is unknown until the load finishes
- **THEN** the size stays 1024 by 1024 during and after the load

#### Scenario: Stored size matches no preset

- **WHEN** the form's width and height match none of the presets for the loaded family
- **THEN** Custom is selected and the width, height and swap controls are visible
- **AND** the stored width and height are not changed

#### Scenario: Model family changes with a preset selected

- **WHEN** the size matches the 16:9 preset of SD 1.5 and the user loads an SDXL model
- **THEN** the size becomes 1344 by 768

#### Scenario: Swap width and height

- **WHEN** Custom is selected and the user presses swap
- **THEN** width and height exchange values

### Requirement: Slider Controls

Images per run, steps and CFG SHALL be sliders that show their current value.

#### Scenario: Images per run range

- **WHEN** the user drags the images per run slider
- **THEN** the value stays between 1 and 8

#### Scenario: Values above the range enter the form

- **WHEN** the form loads, or a history run is reused, with `number_of_images` 12, `steps` 150 or `cfg_scale` 40
- **THEN** the form holds 8, 100 and 30 respectively before any submit

#### Scenario: Steps presets

- **WHEN** the user presses the 24 steps preset
- **THEN** the steps slider and the form value become 24

### Requirement: Inspector Tabs Replace Style And LoRA Modals

LoRA and style selection SHALL happen inside inspector tabs, and the Styles and Extra modals SHALL be removed.

#### Scenario: Add a LoRA from the library

- **WHEN** the user opens the LoRA tab and adds a LoRA from the library
- **THEN** it appears under Active with a weight slider
- **AND** it appears as a pill in the dock

#### Scenario: Select a style

- **WHEN** the user opens the Styles tab and selects a style
- **THEN** the style appears under Selected
- **AND** no modal opens

### Requirement: Stage States

The stage SHALL show exactly one state panel, in priority order: backend offline, model loading, generation failed, no model selected, first run, results.

#### Scenario: Backend offline

- **WHEN** the socket is disconnected
- **THEN** the stage shows "Backend stopped responding" with "Retry now" and "Open logs"
- **AND** "Retry now" reconnects the socket

#### Scenario: Model loading

- **WHEN** a model load is in progress
- **THEN** the stage shows the model name, a progress bar and the percent over the last preview

#### Scenario: Generation failed

- **WHEN** a generation request fails
- **THEN** the stage shows the failure with the backend error message and, when a step event arrived, the last step reached
- **AND** it offers "Try again", "Memory settings" and "Logs"
- **AND** starting a new generation or switching modes clears the failure

#### Scenario: Validation error from the backend

- **WHEN** the backend answers a generation request with a 422 whose `detail` is a list
- **THEN** the failure message joins the `msg` of each entry

#### Scenario: No model selected

- **WHEN** no model is selected
- **THEN** the stage shows a panel pointing to the model selector

#### Scenario: First run

- **WHEN** there are no generated items and no history entries
- **THEN** the stage shows "Your first image" and the prompt placeholder "Describe the image you want to create"

### Requirement: Image To Image Layout

In image mode, the stage SHALL show the input image next to the output, and the Basic tab SHALL show denoising strength and resize mode above the size presets.

#### Scenario: Image mode

- **WHEN** the user switches to Image to image with an input image set
- **THEN** the input image renders to the left of the output with replace and remove actions
- **AND** the Basic tab shows denoising strength and resize mode above Size

### Requirement: Recent Runs Strip

The stage SHALL show the current run's thumbnails and the recent history runs under the preview.

#### Scenario: Reuse a recent run

- **WHEN** the user hovers a recent run and presses "Use this config"
- **THEN** the form takes that run's config

### Requirement: Full-Screen Viewer

Opening an output SHALL show a full-window viewer with the prompt, seed, navigation, a thumbnail strip, "Use as input", "Download" and close.

#### Scenario: Prompt and seed of the shown run

- **WHEN** the viewer opens after a run submitted with seed -1, and the user has since edited the prompt
- **THEN** the header shows the prompt as submitted and the seed as "Random"

#### Scenario: Navigate and close

- **WHEN** the viewer is open on image 1 of 4 and the user presses the right arrow key
- **THEN** image 2 of 4 shows
- **AND** pressing Escape closes the viewer
