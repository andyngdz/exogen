---
name: testing-requirements
description: Use when writing tests - test structure, verification steps, coverage goals
---

# Testing Requirements

Use this skill when implementing features that need testing or modifying existing tests.

## Checklist

### Test Framework Setup

- [ ] **Location**: Create tests in `__tests__/` folder next to source files
- [ ] **Framework**: Use Vitest + React Testing Library
- [ ] **File naming**: `ComponentName.test.tsx` or `functionName.test.ts`

### Test Structure

- [ ] **Test behavior, not implementation**
  - What the code does, not how it does it
  - User-facing behavior and outcomes
  - API contracts and data flow
- [ ] **Mock external dependencies**
  - APIs and React Query hooks
  - Electron APIs via `global.window.electronAPI`
  - Socket.io events and handlers
  - Zustand stores (reset in `beforeEach`)
- [ ] **Keep tests focused and readable**
  - One concern per test
  - Clear test names describing behavior
  - Arrange-Act-Assert pattern

### Common Testing Patterns

**Socket Events - Capture handlers:**

```typescript
let handlers: Record<string, (data: unknown) => void> = {}
vi.mock('@/cores/sockets', () => ({
  useSocketEvent: (event, handler) => (handlers[event] = handler)
}))

// Trigger event in test
handlers[SocketEvents.DOWNLOAD_START]({ id: 'model-123' })
```

**Zustand Stores:**

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyStore } from './useMyStore'

const { result } = renderHook(() => useMyStore())
act(() => result.current.setValue('new'))
```

**React Query:**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

render(<MyComponent />, { wrapper })
```

### Coverage Goals

- [ ] **Aim for 100% on critical paths**
  - State management logic
  - Data flow and transformations
  - Business logic
- [ ] **Run coverage**: `pnpm run test:coverage -- path/to/files`
- [ ] **Focus on behavior coverage**, not just line coverage

### Pre-Completion Verification

Before marking work complete, ALWAYS run:

- [ ] `pnpm run type-check` - TypeScript validation
- [ ] `pnpm run lint` - ESLint checks
- [ ] `pnpm run format` - Prettier formatting
- [ ] `pnpm test -- path/to/test` - Run specific tests

### Testing Anti-Patterns to Avoid

❌ **Don't test implementation details**

- Example: Testing that `socket.on` was called 3 times
- Instead: Test that component responds correctly to events

❌ **Don't use `any` type in tests**

- Use proper types, `unknown`, or `as unknown as Type`

❌ **Don't skip cleanup**

- Always reset Zustand stores in `beforeEach`
- Clear mocks between tests
