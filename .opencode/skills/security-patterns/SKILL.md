---
name: security-patterns
description: Use when working with Electron - IPC security, renderer isolation, Node API access
---

# Electron Security Patterns

Use this skill when implementing features that interact with Electron APIs or system resources.

## Checklist

### Core Security Principle

- [ ] **Renderer process cannot access Node.js APIs directly**
  - This is enforced by Electron's contextIsolation
  - All system access must go through IPC bridges
  - Prevents malicious code from accessing system resources

### IPC Bridge Pattern

- [ ] **Define IPC handlers in `electron/preload.ts`**
  - Use `contextBridge.exposeInMainWorld()` to expose APIs
  - Create type-safe interfaces for exposed APIs
  - Follow the `window.electronAPI` namespace convention

### Example: Adding New Electron API

**Step 1: Define handler in preload.ts**

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  backend: {
    start: () => ipcRenderer.invoke('backend:start'),
    stop: () => ipcRenderer.invoke('backend:stop'),
    // Add new method here
    getStatus: () => ipcRenderer.invoke('backend:status')
  }
})
```

**Step 2: Implement handler in main process**

```typescript
// electron/main.ts
ipcMain.handle('backend:status', async () => {
  // Access Node.js APIs safely here
  return await checkBackendStatus()
})
```

**Step 3: Use in renderer process**

```typescript
// src/components/MyComponent.tsx
'use client'

const status = await window.electronAPI.backend.getStatus()
```

### Security Checklist

- [ ] **Never expose raw IPC methods** to renderer
  - Don't expose `ipcRenderer.send()` or `ipcRenderer.invoke()` directly
  - Create specific, scoped methods instead
- [ ] **Validate all IPC inputs** in main process
  - Don't trust data from renderer process
  - Sanitize file paths, validate ranges, check types
- [ ] **Use typed interfaces** for IPC communication
  - Define types in `types/` directory
  - Share types between main and renderer processes
- [ ] **Minimize exposed surface area**
  - Only expose what's necessary
  - Don't create generic "execute command" handlers

### Common Patterns

**File system access:**

```typescript
// ✅ Good - specific, validated
contextBridge.exposeInMainWorld('electronAPI', {
  files: {
    readConfig: () => ipcRenderer.invoke('files:read-config'),
    saveImage: (data: Buffer) => ipcRenderer.invoke('files:save-image', data)
  }
})

// ❌ Bad - too generic, security risk
contextBridge.exposeInMainWorld('electronAPI', {
  files: {
    read: (path: string) => ipcRenderer.invoke('files:read', path) // Unsafe!
  }
})
```

**Process management:**

```typescript
// ✅ Good - scoped to backend process
backend: {
  start: () => ipcRenderer.invoke('backend:start'),
  stop: () => ipcRenderer.invoke('backend:stop')
}

// ❌ Bad - can execute arbitrary commands
system: {
  exec: (command: string) => ipcRenderer.invoke('exec', command) // Very unsafe!
}
```

## Reference

See Electron Security Guide: https://www.electronjs.org/docs/latest/tutorial/security
