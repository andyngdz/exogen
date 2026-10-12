## ADDED Requirements

### Requirement: HeroUI v3 As The UI Framework

The frontend SHALL use HeroUI v3 (`@heroui/react` 3.2.6 with `@heroui/styles`) for all HeroUI components, with no HeroUI v2 package, provider, or Tailwind plugin installed.

#### Scenario: Only v3 packages are installed

- **WHEN** `package.json` is inspected
- **THEN** it lists `@heroui/react` at 3.2.6 and `@heroui/styles`
- **AND** it does not list `@heroui/theme`, `@heroui/system`, or `@heroui/use-disclosure`

#### Scenario: App root renders without a HeroUI provider

- **WHEN** the application root renders
- **THEN** no `HeroUIProvider` wraps the tree
- **AND** a single `Toast.Provider` is mounted

### Requirement: Dark Theme Values Preserved

The application SHALL keep its dark theme with accent `#5048e5` and page background `#0b0c11`, expressed as HeroUI v3 CSS variables and painted on the page.

#### Scenario: Dark theme applies on launch

- **WHEN** the application loads
- **THEN** the `<html>` element carries the `dark` class
- **AND** the computed `--accent` is `#5048e5`
- **AND** the computed `background-color` of `<body>` is `#0b0c11`

### Requirement: Layout And Behavior Parity

Every screen SHALL keep the layout, content, text hierarchy, and behavior it had on HeroUI v2; only component styling follows v3 defaults.

#### Scenario: Screen layout matches the v2 baseline

- **WHEN** a screen from the baseline set is captured after migration
- **THEN** its sections, controls, and text appear in the same arrangement as the baseline capture from `main`
- **AND** secondary text stays visually dimmer than primary text

#### Scenario: Modals open and close as before

- **WHEN** the user opens any modal or drawer
- **THEN** it opens from the same trigger
- **AND** it closes from its close control, the backdrop, and the Escape key where the v2 version allowed each

#### Scenario: Pressable cards respond to pointer and keyboard

- **WHEN** the user clicks a pressable card, or focuses it and presses Enter or Space
- **THEN** the card's action runs
- **AND** pressing a button nested inside the card runs only that button's action

#### Scenario: Pending buttons block repeat submits

- **WHEN** an action with a v2 loading state is in progress
- **THEN** its button shows the v3 pending state and ignores further presses

#### Scenario: Toasts report the same events

- **WHEN** an action that raised a toast on v2 completes, warns, or fails
- **THEN** a toast with the same title and description appears
- **AND** it uses the success, warning, or danger variant matching the v2 color

### Requirement: Removed v2 Components Replaced

Components that HeroUI v3 removed SHALL be replaced without losing their function.

#### Scenario: Editor header without Navbar

- **WHEN** the editor renders
- **THEN** its header shows the logo, the model selector, and the model search button in the same positions as before

#### Scenario: Suggested command can be copied

- **WHEN** the health check shows a suggested command
- **THEN** the command text is displayed in monospace
- **AND** a copy button copies it to the clipboard
