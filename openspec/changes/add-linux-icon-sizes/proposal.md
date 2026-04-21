# Change: Add Linux Icon Sizes

## Why

Linux desktop environments require multiple icon sizes for proper display across different contexts (taskbar, application launcher, dock, etc.). The current single 512x512 icon may not display correctly in all Linux desktop environments because they expect icons in specific sizes.

## What Changes

- Generate multiple icon sizes (16, 32, 48, 64, 128, 256, 512) from the source logo
- Place icons in `build/icons/` directory following electron-builder conventions
- Update `electron-builder.yaml` to reference the icons directory for Linux builds

## Impact

- Affected specs: `release` (icon configuration for builds)
- Affected files:
  - `build/icons/` - New directory with resized icons
  - `electron-builder.yaml` - Update Linux icon path to use icons directory
