# Design: Migrate HeroUI v2 To v3

## Problem

The frontend runs HeroUI 2.8.6. The approved redesign targets HeroUI 3.2.6, whose components, theming, and provider model differ from v2. The framework has to move before the redesign starts.

## Decisions Already Made

All of these came from the user on 2026-09-28 and are not open questions:

- Upgrade HeroUI in its own pull request, before the redesign, on branch `refactor/heroui-v3`.
- Write this OpenSpec change before touching code.
- Keep every screen's layout; accept v3 default component styling.
- Keep the current dark theme values: accent `#5048e5`, background `#0b0c11` (from `src/app/hero.ts`).
- Single-pass migration (approach B): swap the packages, then fix all code until it builds. The alternative, running v2 and v3 side by side through an `@heroui-v3/react` alias, was offered and declined.

## Goals

- Every `@heroui/react` import resolves to v3.2.6.
- No v2-only package, provider, plugin, CSS variable, or utility class remains.
- Each screen keeps its layout, content, text hierarchy, and behavior.
- `pnpm run type-check`, `pnpm run lint`, `pnpm test`, and `pnpm build` pass.

## Non-Goals

- Redesign work, new screens, or flow changes.
- Custom CSS that recreates v2 radius, spacing, or shadows.
- A wrapper layer over HeroUI. No caller needs one, and the redesign rewrites these components anyway.

## Package Decision

This change replaces an existing dependency with its next major version; no new behavior is introduced, so no package-vs-custom choice arises. Target versions come from the npm registry on 2026-09-28: `@heroui/react@3.2.6` (`latest`) and `@heroui/styles@3.2.6`.

`@heroui/react@3.2.6` peer dependencies: `react >=19` (repo has 19.2.3), `tailwindcss >=4` (repo has 4.1.18), `react-aria ^3.52.1`, `react-aria-components ^1.21.1`, `@react-aria/ssr ^3.10.1`, `@react-aria/utils ^3.34.1`, `@internationalized/date ^3.12.4`. All are added as direct dependencies.

`framer-motion` stays: `src/cores/presentations/skeleton-loader` imports it directly, independent of HeroUI.

## Design

### Infrastructure

| File                    | Change                                                                                                                                                                                                                                                                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`          | `@heroui/react` to `3.2.6`; add `@heroui/styles@3.2.6` and the peer dependencies above; remove `@heroui/theme`, `@heroui/system`, `@heroui/use-disclosure`                                                                                                                                                                              |
| `src/app/hero.ts`       | Delete, together with `src/app/__tests__/hero.test.ts`, which only tests this file                                                                                                                                                                                                                                                      |
| `src/app/globals.css`   | Remove `@plugin './hero.ts'` and the `@source` line for `@heroui/theme`; add `@import "@heroui/styles";` directly after `@import 'tailwindcss';`; set `--accent: #5048e5` and `--background: #0b0c11` under `.dark`; replace the five `hsl(var(--heroui-*))` references with `var(--accent)`, `var(--foreground)`, and `var(--default)` |
| `src/app/layout.tsx`    | Add `bg-background text-foreground` to `<body>`. The v2 plugin painted the page through `addBase` on `:root` (`@heroui/theme/dist/plugin.js`); v3 `base.css` sets no page background, so without this the app loses `#0b0c11`. `className="dark"` on `<html>` stays and matches the v3 `.dark` selector                                 |
| `src/app/providers.tsx` | Remove `HeroUIProvider`; replace `<ToastProvider />` with `<Toast.Provider />`                                                                                                                                                                                                                                                          |

`@heroui/styles` defines `scrollbar`, `scrollbar-thin`, `scrollbar-none`, and `scrollbar-default` utilities, and the still-loaded `tailwind-scrollbar` plugin defines utilities with the same names. `src/` uses none of the plugin's classes (the `scrollbar-thumb`/`-track`/`-button` hits are `::-webkit-scrollbar-*` selectors in CSS). The build step checks the compiled CSS for a collision and for preflight appearing twice, since `@heroui/styles/index.css` imports `tailwindcss` itself; either finding blocks the change until resolved.

### Component API Mapping

Types were read from the published `@heroui/react@3.2.6` package and, for Select, from `react-stately@3.50.0`.

**Renamed, same shape**

| v2                                   | v3                                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `Divider`                            | `Separator`                                                                    |
| `Listbox`, `ListboxItem`             | `ListBox`, `ListBox.Item`                                                      |
| `Skeleton`, `Spinner`, `ButtonGroup` | same names                                                                     |
| `ScrollShadow`                       | same name; `hideScrollBar` becomes `className="scrollbar-none"` (a v3 utility) |

**Renamed and compound**

| v2                               | v3                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Progress` with `label`, `value` | `ProgressBar` with `Label`, `ProgressBar.Output`, `ProgressBar.Track`, `ProgressBar.Fill`                                          |
| `NumberInput` with `label`       | `NumberField` with `Label`, `NumberField.Group`, `NumberField.Input`, `NumberField.IncrementButton`, `NumberField.DecrementButton` |
| `Textarea` with `label`          | `TextField` with `Label` and `TextArea`                                                                                            |
| `Input` with `label`             | `TextField` with `Label` and `Input`; `startContent`/`endContent` become `InputGroup` with `InputGroup.Prefix`/`InputGroup.Suffix` |

**Compound in v3**

| v2                                                                                  | v3                                                                                                                                                                                                                                                                                | Files |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`, `useDisclosure` | `Modal`, `Modal.Backdrop`, `Modal.Container`, `Modal.Dialog`, `Modal.Header`, `Modal.Heading`, `Modal.Body`, `Modal.Footer`, `Modal.CloseTrigger`; open state from `useOverlayState` (`isOpen`, `open`, `close`, `setOpen`) passed as `isOpen`/`onOpenChange` on `Modal.Backdrop` | 11    |
| `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerBody`                             | `Drawer.Backdrop`, `Drawer.Content`, `Drawer.Dialog`, `Drawer.Header`, `Drawer.Body`                                                                                                                                                                                              | 1     |
| `Card`, `CardHeader`, `CardBody`, `CardFooter`                                      | `Card.Header`, `Card.Content`, `Card.Footer`                                                                                                                                                                                                                                      | 10    |
| `Select`, `SelectItem`, `SelectSection`                                             | `Select.Trigger`, `Select.Value`, `Select.Indicator`, `Select.Popover`, with `ListBox`, `ListBox.Item`, `ListBox.Section` inside the popover                                                                                                                                      | 5     |
| `Tabs`, `Tab`                                                                       | `Tabs.List`, `Tabs.Tab`, `Tabs.Panel`                                                                                                                                                                                                                                             | 3     |
| `Tooltip` with `content` prop                                                       | `Tooltip.Trigger`, `Tooltip.Content`                                                                                                                                                                                                                                              | 4     |
| `Slider`                                                                            | `Slider.Output`, `Slider.Track`, `Slider.Fill`, `Slider.Thumb`                                                                                                                                                                                                                    | 7     |
| `Table`, `TableHeader`, `TableColumn`, `TableBody`, `TableRow`, `TableCell`         | `Table.Content`, `Table.Header`, `Table.Column`, `Table.Body`, `Table.Row`, `Table.Cell`                                                                                                                                                                                          | 1     |
| `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem`                       | `Dropdown.Trigger`, `Dropdown.Popover`, `Dropdown.Menu`, `Dropdown.Item`                                                                                                                                                                                                          | 1     |
| `Accordion`, `AccordionItem`                                                        | `Accordion.Item`, `Accordion.Heading`, `Accordion.Trigger`, `Accordion.Panel`, `Accordion.Body`                                                                                                                                                                                   | 1     |
| `RadioGroup`, `Radio`                                                               | `RadioGroup`, `Radio` with `Radio.Content`, `Radio.Control`, `Radio.Indicator`; label as plain text                                                                                                                                                                               | 2     |
| `Switch`                                                                            | `Switch` with `Switch.Content`, `Switch.Control`, `Switch.Thumb`                                                                                                                                                                                                                  | 2     |
| `Checkbox`                                                                          | `Checkbox` with `Checkbox.Content`, `Checkbox.Control`, `Checkbox.Indicator`                                                                                                                                                                                                      | 1     |
| `Avatar`                                                                            | `Avatar` with `Avatar.Image`, `Avatar.Fallback`                                                                                                                                                                                                                                   | 2     |
| `Alert`                                                                             | `Alert` with `Alert.Indicator`, `Alert.Content`, `Alert.Title`, `Alert.Description`                                                                                                                                                                                               | 2     |
| `Badge`                                                                             | `Badge.Anchor` wrapping the target, `Badge.Label` for the content                                                                                                                                                                                                                 | 1     |
| `Breadcrumbs`, `BreadcrumbItem`                                                     | `Breadcrumbs`, `Breadcrumbs.Item`                                                                                                                                                                                                                                                 | 1     |
| `addToast({ title, description, color })`                                           | `toast.success(title, { description })`, `toast.danger(...)`, `toast.warning(...)` from `@heroui/react`, picked by the v2 `color`; 17 calls in 10 files                                                                                                                           | 10    |

Exact file lists per row are in `tasks.md`.

**Type imports with no v3 export**

| v2 type                                                                              | Replacement                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `SliderValue` (3 files)                                                              | `number \| number[]`, the value type of v3 `Slider`     |
| `NumberInputProps`                                                                   | `NumberFieldProps`                                      |
| `ModalProps`, `SliderProps`, `ChipProps`, `RadioProps`, `ButtonProps`, `AvatarProps` | the v3 types of the same name                           |
| `Selection`                                                                          | `Key` from `react-aria-components` for single selection |

**Removed in v3**

| v2                                                     | Replacement                                                                                    | File                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `Navbar`, `NavbarBrand`, `NavbarContent`, `NavbarItem` | `<header>` with Tailwind flex classes reproducing the current three-slot row and bottom border | `features/editors/presentations/EditorNavbar.tsx`                 |
| `Snippet`                                              | `<code>` plus a v3 `Button` that copies the command                                            | `features/health-check/presentations/SuggestedCommands.tsx`       |
| `Image`                                                | `next/image`                                                                                   | `features/generator-image-input/presentations/ImageInputBody.tsx` |

### Props That Move Or Disappear

| v2 prop                                                                                                                                                                               | v3 handling                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `classNames={{ slot: ... }}` (16 files)                                                                                                                                               | `className` on the compound member that owns that slot (for example `classNames.body` on Modal becomes `className` on `Modal.Body`)                                                                                                                                                                                                                                                                               |
| `startContent`, `endContent` on `Button`                                                                                                                                              | icon placed as a child before or after the label                                                                                                                                                                                                                                                                                                                                                                  |
| `startContent`, `endContent` on `Input`                                                                                                                                               | `InputGroup.Prefix`, `InputGroup.Suffix`                                                                                                                                                                                                                                                                                                                                                                          |
| `startContent`, `isCurrent`, `classNames.item` on `BreadcrumbItem` (`GenerationPhaseStepper`)                                                                                         | the phase indicator becomes a child placed before the label inside `Breadcrumbs.Item`; `classNames.item` becomes `className`. v3 derives `isCurrent` from position (last item), but the current phase is not always last, so the current item gets `className="text-foreground font-medium"` and the others `text-muted`, with `aria-current="step"` on the current item where the v3 item type accepts it        |
| `endContent={<DeleteModelButton />}` on `ListboxItem` (`ModelManagement`)                                                                                                             | `DeleteModelButton` rendered as a child of `ListBox.Item` after the model name, with `textValue={model.model_id}`. The list has no `selectionMode`, as in v2, so the nested button keeps the same press and keyboard behavior as the v2 option did                                                                                                                                                                |
| `startContent`, `endContent` passed through `NumberInputController` (callers: `GeneratorConfigFormat`, `GeneratorConfigSeed`, `GeneratorConfigQuantity`, `GeneratorConfigSampling`)   | `NumberInputController` keeps `startContent`/`endContent` as its own `ReactNode` props and renders them inside `NumberField.Group`, before and after `NumberField.Input`; callers stay unchanged                                                                                                                                                                                                                  |
| `isLoading` on HeroUI `Button` (6 uses: `UploadLoraButton`, `GeneratorPhotoviewModal`, `HistoryDeleteButton`, `DeleteModelButton`, `ModelSearchViewDownloadButton`, `UpdateSettings`) | `isPending`. The other 6 `isLoading` props in `src/` belong to app components (`SkeletonLoader`, `ImageInputTopRight`, `ImageInputZone`) and stay as they are                                                                                                                                                                                                                                                     |
| `isPressable`, `onPress` on `Card` (4 files: `LoraListItem`, `GeneratorPreviewTile`, `HistoryItemContainer`, `ModelSearchItem`)                                                       | `usePress` from `react-aria` spread onto the `Card` root, plus `role="button"` and `tabIndex={0}`. In v2, `HistoryItemContainer` and `GeneratorPreviewTile` rendered a pressable `div` (`as="div"`), while `LoraListItem` and `ModelSearchItem` rendered a native `<button>`; all four become a `role="button"` div. A native `<button>` is not used because `HistoryItemContainer` nests buttons inside the card |
| `shadow` on `Card` (5 uses)                                                                                                                                                           | removed; v3 surface styling applies                                                                                                                                                                                                                                                                                                                                                                               |
| `scrollBehavior` on `Modal` (5 uses)                                                                                                                                                  | `scroll` on `Modal.Container`                                                                                                                                                                                                                                                                                                                                                                                     |
| `placement` on `Modal` (`center`, `bottom`)                                                                                                                                           | same prop and values on `Modal.Container`                                                                                                                                                                                                                                                                                                                                                                         |
| `size="2xl"` on `Modal` (`SettingsModal`, `ExtraModal`, `GeneratorConfigStyleModal`)                                                                                                  | `size="lg"` on `Modal.Container` plus `className="max-w-2xl"` on `Modal.Dialog`; v3 sizes stop at `lg`, `full`, `cover`, and v2 `2xl` was `max-w-2xl`                                                                                                                                                                                                                                                             |
| `size="5xl"` on `Modal` (`GeneratorPhotoviewModal`, `HistoryPhotoviewModal`)                                                                                                          | `size="lg"` on `Modal.Container` plus `className="max-w-5xl"` on `Modal.Dialog`                                                                                                                                                                                                                                                                                                                                   |
| default close button on `Modal`                                                                                                                                                       | every modal renders `Modal.CloseTrigger`, since v2 showed one unless `hideCloseButton` was set (0 uses in the repo)                                                                                                                                                                                                                                                                                               |
| `backdrop="blur"` on `Modal` (3 uses)                                                                                                                                                 | `variant="blur"` on `Modal.Backdrop`                                                                                                                                                                                                                                                                                                                                                                              |
| `selectedKeys` (Set), `onSelectionChange` (Set) on `Select`                                                                                                                           | `value` (single key) and `onChange` (single key), the current single-selection props in `react-stately@3.50.0`; `selectedKey`/`onSelectionChange` are deprecated there                                                                                                                                                                                                                                            |

### Button Variants

v3 `Button` variants are `primary`, `secondary`, `tertiary`, `outline`, `ghost`, `danger`, `danger-soft`. There is no `color` or `radius` prop, and the default variant is `primary` (accent fill), unlike v2's default gray. Every Button therefore gets an explicit variant.

| v2 props                                 | v3 props                                    |
| ---------------------------------------- | ------------------------------------------- |
| no variant, no color (6 uses)            | `variant="tertiary"`                        |
| `variant="solid" color="default"`        | `variant="tertiary"`                        |
| `color="primary"` (solid or no variant)  | `variant="primary"`                         |
| `variant="light"`                        | `variant="ghost"`                           |
| `variant="light" color="primary"` (3)    | `variant="ghost" className="text-accent"`   |
| `variant="light" color="danger"` (2)     | `variant="ghost" className="text-danger"`   |
| `variant="bordered"`                     | `variant="outline"`                         |
| `variant="bordered" color="primary"` (1) | `variant="outline" className="text-accent"` |
| `variant="flat" color="primary"`         | `variant="secondary"`                       |
| `variant="flat"` with default color      | `variant="tertiary"`                        |
| `color="danger"` (solid)                 | `variant="danger"`                          |
| `variant="flat" color="danger"`          | `variant="danger-soft"`                     |
| `radius="full"`                          | removed; icon-only buttons use `isIconOnly` |
| `size="sm" / "md" / "lg"`                | unchanged                                   |

### Chip And Badge

v3 `Chip` colors are `accent`, `default`, `success`, `warning`, `danger`; variants are `primary`, `secondary`, `tertiary`, `soft`, and the default variant is `secondary`. v2 Chips with no variant were solid, so every Chip gets an explicit variant.

| v2                                       | v3                                             |
| ---------------------------------------- | ---------------------------------------------- |
| no variant (solid)                       | `variant="primary"`                            |
| `variant="flat"`                         | `variant="soft"`                               |
| `variant="bordered"`                     | `variant="tertiary"`                           |
| `color="primary"` or `color="secondary"` | `color="accent"` (v3 has no `secondary` color) |
| other colors                             | unchanged                                      |

This covers `HealthStatusChip.tsx`, the `Badge` in `BackendStatusItem.tsx`, and the color values in `model_tag.ts`, which is typed as `ChipProps['color']`.

### Utility Classes

v3 exposes these Tailwind colors (verified in `@heroui/styles/dist/themes/shared/theme.css`): `accent`, `accent-soft`, `default`, `foreground`, `muted`, `surface`, `surface-secondary`, `surface-tertiary`, `overlay`, `field`, `border`, `separator`, `success`, `warning`, `danger`.

| v2 class                                                        | v3 class                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `text-default-500`, `text-default-600`                          | `text-muted`                                                                |
| `text-default-700`, `text-default-900`, `text-default`          | `text-foreground` (keeps 700 brighter than 500 so the text hierarchy holds) |
| `*-primary`, `*-primary/NN`, `ring-primary-300`, `fill-primary` | `*-accent`, `*-accent/NN`                                                   |
| `bg-content2`                                                   | `bg-surface-secondary`                                                      |
| `bg-content3`                                                   | `bg-surface-tertiary`                                                       |
| `bg-default-100`, `bg-default-50/20`                            | `bg-default`, `bg-default/20`                                               |
| `border-default`, `divide-default`                              | `border-border`, `divide-separator`                                         |
| `text-danger-500`                                               | `text-danger`                                                               |
| `text-tiny`                                                     | `text-xs`                                                                   |
| `rounded-small`, `rounded-medium`, `rounded-large`              | `rounded-lg`, `rounded-xl`, `rounded-2xl`                                   |
| `*-success`, `*-warning`, `*-danger`, `*-foreground`            | unchanged                                                                   |

Tailwind drops unknown classes without an error, so the Testing section greps for leftovers.

### Tests

63 test files mock `@heroui/react`, and `features/gpu-detection/presentations/__tests__/GpuDetectionItem.test.tsx` renders the real `RadioGroup`, so 64 test files change; one of them, `src/app/__tests__/hero.test.ts`, is deleted with `hero.ts`. Each mock is rewritten to export the v3 names and compound members the component under test uses (for example `Modal.Body`, `Card.Content`, `toast.danger`). Assertions about rendered content and behavior stay unchanged; a test that only asserted a v2 prop value (such as `color="primary"`) is updated to the mapped v3 prop from the tables above.

Six more test files do not touch `@heroui/react` but assert v2 class names that the Utility Classes table renames (`backend-logs.test.ts`, `GeneratorConfigCommonSteps.test.tsx`, `GpuDetectionVersion.test.tsx`, `HistoryPhotoviewConfigRow.test.tsx`, `ModelRecommendationsBadge.test.tsx`, `ModelRecommendationsHeader.test.tsx`). Their expected classes follow the same table.

`openspec/specs/testing-quality/spec.md` describes Select items in v2 terms (`<option>` children). Its "UI Component Compatibility" requirement is modified in this change to describe v3 `ListBox.Item` identity instead.

### Review Units

`plan-specs` asks for every review unit to leave the repo compiling. The single-pass approach makes that impossible between the package swap and the last source fix, because v2 imports stop resolving the moment v3 is installed. The user accepted this. `tasks.md` still groups the work by component family for tracking, and states in its header that sections 2 through 10 do not build on their own; section 11 is the first point where the repo builds.

## Error Handling

No runtime error paths change. Toasts keep their title and description text and move from `addToast({ color })` to `toast.danger`, `toast.success`, or `toast.warning` by the same color.

## Testing

- `pnpm run type-check` passes with zero errors.
- `pnpm run lint` passes.
- `pnpm test` passes, with the number of test files on `main` minus one (`hero.test.ts`).
- `pnpm build` passes, and the compiled CSS has no duplicate preflight and no scrollbar utility collision.
- `grep -rE "@heroui/(theme|system|use-disclosure)|HeroUIProvider|--heroui-" src package.json` returns nothing.
- `grep -rE "\b(useDisclosure|addToast|SliderValue|NumberInputProps|ModalContent|CardBody|SelectItem|Navbar|Snippet|isPressable|classNames=)" src` returns nothing. `startContent`, `endContent`, and `isLoading` are left to type-check, because app components in scope keep props with those names.
- `grep -rE "\b(text|bg|border|ring|fill|divide)-(primary|secondary|content[1-4]|default-[0-9]+)\b|text-tiny|rounded-(small|medium|large)\b" src` returns nothing.
- Baseline screenshots are captured on `main` before the swap for: health check, GPU detection, max memory, model recommendations, editor (text to image and image to image), history photoview, generator photoview, settings modal (all tabs), extra/LoRA modal, styles modal, model search, backend logs drawer. The same screens are captured after migration and compared for layout and text hierarchy parity.
