# Testing

This project uses Vitest + React Testing Library.

## Rules

- Test behavior and contracts, not implementation details.
- Avoid redundant tests. If a higher-level test already covers a behavior, do not re-test it at a lower level.
- Prefer one high-signal assertion over many low-signal ones (e.g. avoid “renders without crashing”).
- Do not assert third-party library internals (HeroUI, React Hook Form, React Query, Allotment, etc.).
- Keep mocks minimal and realistic; mock boundaries (network, Electron, sockets), not pure UI composition.

## What To Test

- State transitions and derived state (Zustand stores, hooks that transform data).
- Critical user flows (submit, error states, loading states, empty states).
- Validation/guards that can block a user action.

## What NOT To Test

- Provider wiring (e.g. “FormProvider was called”). Instead, assert behavior that would fail without context.
- Styling/classnames unless the class is part of a functional contract (e.g. a disabled state).
- Pure pass-through rendering of mocked children.

## Project Patterns

- React Query: use `createQueryClientWrapper()` from `src/cores/test-utils/query-client.tsx`.
- Electron: `window.electronAPI` is globally mocked in `vitest.setup.ts`.
- Sockets: components MUST use `useSocketEvent()`; tests should mock `useSocketEvent()` and trigger captured handlers.
- Zustand: reset stores in `beforeEach/afterEach` to avoid cross-test leakage.

## Reusable Test Wrappers

Use the shared React Hook Form test wrapper(s) from `@/cores/test-utils` instead of creating local `MockFormProvider` / `FormWrapper` components in each test.

- `createFormProviderWrapper()` for general RHF usage
- `createGeneratorConfigFormWrapper()` for generator config form defaults
