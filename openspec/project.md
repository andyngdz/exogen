# Project Context

## Purpose

ExoGen is a desktop application for running AI image generation locally. It provides a user-friendly interface for Stable Diffusion models with features like style presets, LoRA support, high-resolution upscaling, and generation history.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript 5.9
- **Desktop**: Electron (main + renderer process)
- **State**: Zustand 5.x (client state), TanStack Query 5.x (server state)
- **UI**: HeroUI component library
- **Backend**: Python FastAPI (bundled with Electron)
- **Communication**: Socket.IO for real-time events, Axios for REST

## Project Conventions

### Code Style

- Prettier: 2 spaces, single quotes, no semicolons, 100-char width
- PascalCase components with feature prefix (e.g., `GeneratorImageRenderer`)
- camelCase functions/variables, kebab-case directories
- Path aliases: `@/*` for src, `@types` for shared types
- Never use `any` type (enforced as error)

### Architecture Patterns

- Feature-first structure: `src/features/feature-name/{presentations,states}`
- Zustand stores with `reset()` pattern
- Socket.IO: Zustand-based reactive pattern via `useSocketEvent()` hook
- Electron IPC: Frontend uses `window.electronAPI.backend.method()`
- `'use client'` directive for hooks/Zustand/browser APIs

### Testing Strategy

- Vitest for unit tests
- React Testing Library for component tests
- Mock Socket.IO and Electron APIs in tests

### Git Workflow

- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`
- Feature branches merged to main
- Semantic versioning with automated releases

## Domain Context

- **Model**: AI model file (checkpoint) for image generation
- **LoRA**: Low-Rank Adaptation - small fine-tuning weights applied on top of base models
- **Styles**: Predefined prompt modifiers that affect generation aesthetics
- **Hires.fix**: High-resolution upscaling pass after initial generation
- **Upscaler**: Algorithm for enlarging images (Lanczos, Bicubic, etc.)

## Important Constraints

- Local-first: Backend runs locally, no cloud dependencies
- Single-user: No multi-tenancy or authentication needed
- Electron security: IPC isolation between main/renderer processes

## External Dependencies

- Python FastAPI backend (bundled, always available)
- Stable Diffusion models (user-provided)
- CUDA/GPU for acceleration (optional, CPU fallback)
