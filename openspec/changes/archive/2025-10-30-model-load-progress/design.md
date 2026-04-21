# 001: Model Load Progress Bar

**Feature:** Real-time progress bar for model loading in the Editor
**Status:** ✅ Completed
**Dependencies:** Socket.IO infrastructure, Backend MODEL_LOAD_STARTED/PROGRESS events

---

## Problem

Users have no visual feedback when loading a model in the Editor. Model loading can take 30 seconds to several minutes, causing:

- Uncertainty about whether loading is progressing or stuck
- No visibility into loading status
- Poor user experience

---

## Solution

Implement a progress bar below EditorNavbar that shows real-time model loading progress via Socket.IO events.

**User Requirements:**

- Show only during loading (conditional rendering)
- Display step message (e.g., "Loading model weights...")
- No model ID filtering needed (single-user local app)

---

## Architecture

### Socket Events (Backend → Frontend)

```typescript
MODEL_LOAD_STARTED // When loading begins
MODEL_LOAD_PROGRESS // Progress updates with step/total information
MODEL_LOAD_COMPLETED // When loading finishes
```

### Data Flow

```
Backend: model_loader()
  ↓ emits MODEL_LOAD_STARTED
Frontend: useModelLoadProgress hook
  ↓ updates Zustand store
ModelLoadProgressBar component
  ↓ renders Progress with Activity
User sees: progress bar below navbar
```

### State Management

**Zustand Store** (`useModelLoadProgressStore`):

- `id?: string` - Model being loaded
- `progress?: ModelLoadProgressResponse` - Current progress data
- `onUpdateProgress()` - Update progress
- `onSetId()` - Set loading model ID
- `reset()` - Clear state (uses `store.getInitialState()`)

**Hook** (`useModelLoadProgress`):

- Subscribes to 3 socket events
- Returns: `{ isLoading: boolean, message: string, percentage: number }`

---

## Implementation

### Files to Create

1. `src/cores/sockets/types.ts` - Add ModelLoadPhase enum + interfaces
2. `src/cores/sockets/constants/events.ts` - Add MODEL_LOAD_STARTED, MODEL_LOAD_PROGRESS
3. `src/features/model-load-progress/states/useModelLoadProgressStore.ts`
4. `src/features/model-load-progress/states/useModelLoadProgress.ts`
5. `src/features/model-load-progress/presentations/ModelLoadProgressBar.tsx`
6. `src/features/model-load-progress/states/index.ts`
7. `src/features/model-load-progress/index.ts`
8. Tests

### Files to Modify

1. `src/cores/sockets/index.ts` - Export new types
2. `src/features/editors/presentations/Editor.tsx` - Add ModelLoadProgressBar

---

## Technical Details

### Types

```typescript
export enum ModelLoadPhase {
  INITIALIZATION = 'initialization',
  LOADING_MODEL = 'loading_model',
  DEVICE_SETUP = 'device_setup',
  OPTIMIZATION = 'optimization'
}

export interface ModelLoadProgressResponse {
  id: string
  step: number // Current step in loading process
  total: number // Total steps (varies by model/backend)
  phase: ModelLoadPhase
  message: string
}

export interface ModelLoadStartedResponse {
  id: string
}
```

### Component

```tsx
<Activity mode={isLoading ? 'visible' : 'hidden'}>
  <Progress size="sm" value={percentage} label={message} showValueLabel />
</Activity>
```

---

## Coding Patterns Applied

- ✅ `onEventName` naming (not `handleEventName`)
- ✅ Zustand `reset: () => set(store.getInitialState())`
- ✅ Type-safe enum for phase
- ✅ message always string (fallback: 'Loading model...')
- ✅ React 19.2 Activity component for show/hide

---

## Testing

- Socket event subscriptions
- Store state updates
- Reset functionality
- Component rendering (hidden/visible)
- Percentage calculation

---

## Verification

```bash
npm run type-check
npm run lint
npm run format
npm test -- src/features/model-load-progress/
```
