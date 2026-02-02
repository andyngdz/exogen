# Coding Style

- **Language**: TypeScript with ES modules, path aliases (`@/*`, `@types`)
- **Imports**: Prefer importing from feature barrel files (`../states`, `../presentations`) rather than individual files (`../states/useHealthCheck`). This keeps imports cleaner and allows internal refactoring without updating import paths.
- **Format**: Prettier (2 spaces, single quotes, no semicolons, 100-char width)
- **Naming**:
  - PascalCase for components, camelCase for functions/variables, kebab-case for directories
  - Component names should include feature prefix (e.g., `GeneratorImageRenderer`, `GeneratorImageDownloadButton` for generator feature)
  - Event handlers must start with `on` prefix (e.g., `onClick`, `onSubmit`, `onPhaseChange`)
  - Async handlers should use `async/await` and be typed as `Promise<void>` when awaited by callers
- **Commits**: Conventional format (`feat:`, `fix:`, `test:`, `chore:`)
- **Testing**: Follow `docs/TESTING.md` (behavior-first, avoid redundant tests, reuse test wrappers)
- **Comments**: Write what code does, not why or how. Keep short and action-focused. Use `// Step N: <action>` for workflows. Avoid redundant explanations. When code is self-documenting (e.g., well-named functions/hooks), omit comments entirely.
- **Simplicity**:
  - Prefer simple variables over nested property access (e.g., `model_id` vs `modelDetails?.id`)
  - Use direct function refs vs arrow functions when no args needed (e.g., `onPress={openModal}`)
  - Apply YAGNI - don't add features for hypothetical future needs
  - Use `es-toolkit/compat` utilities (e.g., `isEmpty(array)` vs `array.length === 0`)
  - Extract conditional checks into named variables before using in JSX
  - Prefer explicit `if/return` over nested ternaries for readability
  - Prefer `condition && <Component />` over `condition ? <Component /> : undefined` when the false branch renders nothing

- **Research first**: Check official documentation and existing patterns before implementing new features or using unfamiliar APIs.
- **Type safety**:
  - Never use `any` type. Use proper types, `unknown`, or type assertions (`as Type`) instead
  - Use built-in utility types where appropriate (e.g., `VoidFunction` instead of `() => void`)
  - For callback/handler inputs, prefer minimal param interfaces for the fields you actually read (avoid requiring full React/DOM event types)

- **Truthiness & Nullish Checks**:
  - Prefer truthy checks over explicit comparisons: `if (value)` not `if (value !== undefined)`
  - Use `!!value` to convert to boolean, `!value` for negation
  - Use nullish coalescing `??` for defaults: `value ?? fallback` not `value !== undefined ? value : fallback`
  - Use optional chaining `?.` for safe access: `obj?.prop` not `obj && obj.prop`
  - Exception: Use explicit checks when `0`, `''`, or `false` are valid values that shouldn't be falsy

- **State Management**:
  - Use Zustand stores for shared state across components
  - Centralize UI state (modal open/close, tab selection) in stores when multiple components need to control it
  - Use local state (`useState`) for component-specific state
  - When storing UI state in Zustand, use `partialize` to exclude it from persistence
  - For persistent component state, prefer `useLocalStorage` from `react-use` over `useRef`

- **Component Structure**: Position hook calls at the top - custom hooks first, then UI library hooks, then useState/useEffect

- **Performance**: Use `useMemo` to wrap conditional rendering or expensive JSX computations:

  ```typescript
  const content = useMemo(() => {
    if (shouldShowEmpty) return <EmptyState />
    return <ExpensiveComponent data={filteredData} />
  }, [shouldShowEmpty, filteredData])
  ```

- **es-toolkit Best Practices**:
  - `isEmpty()` is comprehensive - avoid redundant checks like `!value || isEmpty(value)`
  - Prefer empty string `''` over `undefined` for initial string state (more predictable)
