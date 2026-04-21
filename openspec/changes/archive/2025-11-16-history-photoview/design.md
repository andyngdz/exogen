# History Photoview Feature Implementation Plan

## Overview

Create a fullscreen modal carousel that displays history items in a horizontal swipeable view. Users can click any history item container to open the photoview at that specific item, then navigate left/right through all history items.

## Feature Requirements

### User Experience

- Entire history item container is clickable to open photoview
- Modal opens at the clicked history item
- Left/right arrow navigation moves between different history items (not images)
- Continuous loop - after last item, wraps to first item
- Each carousel slide shows complete history details:
  - Header: timestamp + model name
  - Images: responsive grid of all generated images
  - Config: key-value pairs of all generation settings

### Design Decisions (from user clarification)

- **Navigation scope**: Between history items, not individual images
- **Config format**: Simple key-value pairs (e.g., "Steps: 20")
- **Trigger**: Entire history item container is clickable
- **Initial slide**: Opens at the clicked history item
- **Loop behavior**: Continuous loop through all histories

## Architecture

### State Management

**New Zustand Store**: `src/features/histories/states/useHistoryPhotoviewStore.ts`

- `isOpen: boolean` - Modal visibility
- `currentHistoryId: number | null` - Currently displayed history item
- `openPhotoview(historyId: number)` - Opens modal at specific history
- `closePhotoview()` - Closes modal and resets state
- UI state NOT persisted (no localStorage)

### Presentation Components

#### 1. `HistoryPhotoviewModal.tsx` (Main Container)

- HeroUI `Modal` with `size="full"` and `backdrop="blur"`
- Wraps Swiper carousel
- Handles keyboard shortcuts (Escape to close)
- Provides close button in top-right
- Subscribes to `useHistoryPhotoviewStore` for open/close state

#### 2. `HistoryPhotoviewCarousel.tsx` (Swiper Wrapper)

- Uses Swiper.js with `Keyboard` and `Mousewheel` modules
- Loops continuously through all history items
- Sets `initialSlide` based on `currentHistoryId`
- Breakpoints: 1 slide per view on all screen sizes (full card view)
- Includes navigation buttons (ChevronLeft/Right icons)
- Lazy loading for performance

#### 3. `HistoryPhotoviewCard.tsx` (Individual History Display)

- **Header section**:
  - Timestamp formatted with `dateFormatter.time`
  - Model name display
- **Images section**:
  - Responsive grid: 2 cols mobile → 3-4 cols desktop
  - Next.js Image component with proper sizing
  - Uses `useBackendUrl()` for image paths
- **Config section**:
  - ScrollShadow wrapper for long configs
  - Maps all config fields to HistoryPhotoviewConfigRow components

#### 4. `HistoryPhotoviewConfigRow.tsx` (Reusable Config Display)

- Simple label-value row component
- Props: `label: string`, `value: string | number | string[]`
- Special handling for arrays (styles) using NextUI `Chip` components
- Format examples: "Steps: 20", "CFG Scale: 7.5", "Styles: [chip][chip]"

### Modified Components

#### 5. `HistoryItemContainer.tsx` (Add Click Handler)

- Wrap entire container in clickable div
- Add `cursor-pointer` class
- Add hover effect: `hover:bg-default-100 transition-colors`
- Call `openPhotoview(history.id)` on click
- Maintain existing structure and styling

#### 6. `Histories.tsx` (Render Modal)

- Import and render `<HistoryPhotoviewModal />` at root level
- Modal manages its own state via Zustand, no props needed
- Place after existing accordion/history list

## Implementation Steps

1. **Save this plan** to `plans/007-history-photoview.md` ✓
2. **Create Zustand Store** - Define modal state and actions
3. **Build HistoryPhotoviewConfigRow** - Reusable config row component
4. **Build HistoryPhotoviewCard** - Full history card layout
5. **Create HistoryPhotoviewCarousel** - Swiper integration with navigation
6. **Build HistoryPhotoviewModal** - Fullscreen modal wrapper
7. **Modify HistoryItemContainer** - Add click handler to open photoview
8. **Integrate in Histories.tsx** - Render modal component at root
9. **Add Tests** - Test store actions, modal behavior, navigation
10. **Verify** - Run type-check, lint, format, and tests

## Key Technical Decisions

### Why Swiper.js?

- Already used in `GeneratorPreviewerSlider` - proven pattern
- Built-in keyboard navigation and touch support
- Loop mode with proper index handling
- No new dependencies needed

### Why Full-size Modal?

- Immersive viewing experience for detailed history review
- Sufficient space for large image grids + config details
- Consistent with modern gallery patterns

### Why Zustand Store?

- Consistent with existing modal patterns (SettingsModal, StylesModal)
- Allows any component to trigger photoview
- Clean separation of UI state from business logic
- Easy to test in isolation

### Performance Optimizations

- Swiper lazy loading: Only renders visible + adjacent slides
- Next.js Image optimization: Automatic image resizing and lazy loading
- ScrollShadow: Efficient scrolling for long config lists
- Minimal re-renders: Zustand fine-grained subscriptions

## Files to Create/Modify

### New Files (7)

- ✓ `src/features/histories/states/useHistoryPhotoviewStore.ts`
- `src/features/histories/presentations/HistoryPhotoviewModal.tsx`
- `src/features/histories/presentations/HistoryPhotoviewCarousel.tsx`
- `src/features/histories/presentations/HistoryPhotoviewCard.tsx`
- `src/features/histories/presentations/HistoryPhotoviewConfigRow.tsx`
- `src/features/histories/states/__tests__/useHistoryPhotoviewStore.test.ts`
- `src/features/histories/presentations/__tests__/HistoryPhotoviewModal.test.tsx`

### Modified Files (2)

- `src/features/histories/presentations/HistoryItemContainer.tsx`
- `src/features/histories/presentations/Histories.tsx`

## Dependencies

- ✅ All required packages already installed:
  - `swiper@12.0.3` - Carousel functionality
  - `lucide-react` - Icons (ChevronLeft, ChevronRight, X)
  - `@heroui/react` - Modal, Button, Chip, ScrollShadow
  - `next/image` - Optimized image rendering

## Testing Strategy

### Unit Tests

- **Store**: Test all actions (open, close, state updates)
- **Modal**: Test open/close behavior, keyboard shortcuts
- **Card**: Test config rendering, image grid layout
- **ConfigRow**: Test different value types (string, number, array)

### Integration Tests

- Test full flow: click history → modal opens → navigate → close
- Test initial slide positioning based on clicked history
- Test loop behavior at boundaries

### Coverage Goals

- 100% coverage on store actions and state management
- High coverage on modal and carousel behavior
- Focus on user interaction paths

## Acceptance Criteria

- [ ] Clicking any history item opens photoview modal
- [ ] Modal displays the clicked history item first
- [ ] Left/right arrows navigate between history items
- [ ] After last item, loops back to first (and vice versa)
- [ ] Each card shows: header, images grid, config key-values
- [ ] Escape key closes modal
- [ ] Close button works correctly
- [ ] Images load with proper paths and sizing
- [ ] Config displays all fields correctly
- [ ] Styles array shows as chips
- [ ] Responsive layout works on mobile/tablet/desktop
- [ ] All tests pass (type-check, lint, format, unit tests)
