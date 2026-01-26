<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Guide for ExoGen

## Quick Commands

- **Single test**: `pnpm test -- path/to/test.test.ts`
- **All tests**: `pnpm test` | **Coverage**: `pnpm test:coverage`
- **Dev server**: `pnpm run dev` | **Desktop**: `pnpm run desktop`
- **Lint**: `pnpm run lint` | **Format**: `pnpm run format` | **Type check**: `pnpm run type-check`

## Architecture

Next.js 15 + Electron + Python FastAPI. Feature-first structure: `src/features/feature-name/{presentations,states,services}`. Zustand for state, React Query for server data, Socket.io with reactive Zustand pattern (never `socket.on()` directly, use `useSocketEvent()` hook).

## Code Style

- **TypeScript**: Never use `any` (error enforced). Use `unknown` or proper types. Path aliases: `@/*` for src, `@types` for shared types
- **Format**: Prettier - 2 spaces, single quotes, no semicolons, 80-char width
- **Naming**: PascalCase components (with feature prefix: `GeneratorImageRenderer`), camelCase functions/vars, kebab-case dirs
- **Imports**: Group by external → internal → types. Use `es-toolkit/compat` for utilities
- **Components**: `'use client'` for hooks/Zustand/browser APIs. Hooks at top (custom → UI library → React). Use `useMemo` for conditional/expensive renders
- **State**: Zustand for shared state, `useState` for local. Use `partialize` to exclude UI state from persistence. Prefer `useLocalStorage` over `useRef` for persistent component state
- **Optional values**: Prefer `undefined` over `null` for optional state/props (e.g. `lastError?: string`)
- **Types**: When typing DOM/third-party APIs, check the source types first (hover in IDE, or inspect `.d.ts`) and avoid widening types "just in case".
- **Comments**: Brief action-focused (what, not why/how). Use `// Step N: <action>` for workflows. Omit when code is self-documenting
- **Simplicity**: Simple vars over nested access, direct function refs vs arrows, YAGNI principle, extract conditionals to named vars before JSX

## Patterns

- **Services**: Put non-React logic (file/clipboard helpers, data transforms, guards) in `src/features/<feature>/services/`.
- **Service style**: Prefer `export class FooService { ... }` + `export const fooService = new FooService()`; hooks call the singleton.
- **Component split**: When a presentation component grows, split into focused subcomponents (e.g. `ImageInputHeader`, `ImageInputBody`) and keep wiring in the parent.

## Critical Rules

- **Electron IPC**: Frontend uses `window.electronAPI.backend.method()`
- **Sockets**: Only `useSocketEvent()` hook, never direct `socket.on()`
- **Types**: `@typescript-eslint/no-explicit-any` enforced as error
- **Research**: Check official docs/patterns before implementing unfamiliar APIs

## Skills (Mandatory)

**BEFORE any task**: Check if a skill applies → Use it. No exceptions.

- `testing-requirements` - Test structure/verification
- `security-patterns` - Electron IPC security
- `critical-rules` - TypeScript/sockets/useEffect
- `best-practices` - Validation/refactoring
- `communication-guidelines` - Questions/commits

## Documentation to Read

- `@docs/ARCHITECTURE.md` - Stack, structure, circular imports, modularity rules
- `@docs/CODING_STYLE.md` - Complete style guide with examples
- `@docs/DEVELOPMENT_COMMANDS.md` - All available commands
