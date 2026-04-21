## Context

The ExoGen desktop app runs a Python FastAPI backend via `uv run uvicorn`. When the Electron app quits, it calls `stopBackend()` to terminate the backend process. On Windows, this termination is failing because:

1. **Windows SIGTERM limitation**: Windows doesn't have true POSIX signals. `childProcess.kill('SIGTERM')` sends a termination request but may not effectively kill child processes.

2. **Process tree issue**: `uv run uvicorn` spawns `python.exe` as a child process. Killing `uv` doesn't automatically kill `uvicorn`/`python`, leaving orphaned processes.

3. **No waiting mechanism**: The current `stopBackend()` is synchronous and doesn't wait for the process to actually exit.

## Goals / Non-Goals

**Goals:**

- Reliably terminate the entire backend process tree on all platforms (Windows, Linux, macOS)
- Ensure the app shutdown completes and returns control to the terminal
- Handle edge cases gracefully (process already dead, permission errors)
- Use a battle-tested library instead of custom platform-specific code

**Non-Goals:**

- Graceful HTTP shutdown signal to uvicorn (adds complexity, not needed)
- Backend restart functionality (separate concern)

## Decisions

### Decision 1: Use `tree-kill` package

**Rationale**: `tree-kill` is a focused, CommonJS-compatible package specifically designed for killing process trees:

- Cross-platform (Windows, Linux, macOS)
- Tree kill (kills all child processes)
- Simple API: `treeKill(pid, signal, callback)`
- CommonJS compatible (works with Electron's build system)
- Widely used (1M+ weekly downloads)

**Alternatives considered:**

- `fkill` package (ESM-only since v10, incompatible with Electron's CommonJS build)
- Custom `taskkill` implementation (Windows only, more code to maintain)
- Native `process.kill()` (doesn't work reliably on Windows)

### Decision 2: Use SIGTERM for graceful shutdown

**Rationale**: `tree-kill` sends SIGTERM by default, which allows processes to clean up gracefully. On Windows, it uses `taskkill /T /PID` to terminate the process tree.

### Decision 3: Make `stopBackend` async

**Rationale**: We need to wait for the process tree to be killed before exiting. This requires:

1. Making `stopBackend` return a Promise (promisified callback)
2. Update Electron's `before-quit` handler to handle async cleanup
3. Block quit until cleanup completes

### Decision 4: Refactor electron/main.ts to use `main()` pattern

**Rationale**: To use async/await with CommonJS (esbuild outputs CJS), we wrap initialization in an async `main()` function instead of using top-level await or `.then()` chains. This is a clean, common pattern that:

- Works with CommonJS module format
- Avoids `.then()` promise chains (SonarQube preference)
- Keeps code readable and maintainable

## Implementation

### stopBackend (scripts/backend/run-backend.ts)

```typescript
import treeKill from 'tree-kill'

const stopBackend = async () => {
  if (backendProcess?.child?.pid) {
    const pid = backendProcess.child.pid

    try {
      await new Promise<void>((resolve, reject) => {
        treeKill(pid, 'SIGTERM', (err) => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    } catch (error) {
      console.error('Failed to stop backend process:', error)
    }

    backendProcess = null
    backendPort = 8000
  }
}
```

### main() pattern (electron/main.ts)

```typescript
const main = async () => {
  const gotLock = app.requestSingleInstanceLock()

  if (!gotLock) {
    console.log('Another instance is already running, exiting...')
    app.quit()
    return
  }

  // ... event handlers ...

  app.on('before-quit', async (event) => {
    console.log('App is quitting, stopping backend...')
    event.preventDefault()
    await stopBackend()
    app.exit(0)
  })

  await app.whenReady()
  await onAppReady()
}

main()
```

### devall concurrently fix (scripts/devall.ts)

Added `--success first` to concurrently so it reports success when Electron exits cleanly, avoiding red error output when Next.js is killed.

## Risks / Trade-offs

| Risk                        | Mitigation                                           |
| --------------------------- | ---------------------------------------------------- |
| New dependency              | `tree-kill` is well-maintained, widely used          |
| Async change breaks callers | Update Electron handler to await                     |
| No force-kill timeout       | SIGTERM is usually sufficient; can add SIGKILL later |

## Open Questions

None - `tree-kill` is a proven solution for this use case.
