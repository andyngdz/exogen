# Backend Log Streaming

Streams each console log from Electron backend to frontend.

## API

```typescript
type LogLevel = 'log' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: number
}

window.electronAPI.backend.startLogStream(): Promise<void>
window.electronAPI.backend.stopLogStream(): Promise<void>
window.electronAPI.backend.isLogStreaming(): Promise<boolean>
window.electronAPI.backend.onLog(callback: (log: LogEntry) => void): () => void
```

## Usage

```typescript
// Start streaming
await window.electronAPI.backend.startLogStream()

// Listen to each log message
const unsubscribe = window.electronAPI.backend.onLog((log) => {
  console.log(`[${log.level}] ${log.message}`)
  console.log('Time:', new Date(log.timestamp))

  // Add to your array in frontend
  setLogs((prev) => [...prev, log])
})

// Stop streaming
await window.electronAPI.backend.stopLogStream()
```

## React Hook Example

```typescript
import { useEffect, useState, useCallback } from 'react'
import type { LogEntry } from '@/types'

export const useBackendLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isStreaming, setIsStreaming] = useState(false)

  const startStreaming = useCallback(async () => {
    await window.electronAPI.backend.startLogStream()
    setIsStreaming(true)
  }, [])

  const stopStreaming = useCallback(async () => {
    await window.electronAPI.backend.stopLogStream()
    setIsStreaming(false)
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  useEffect(() => {
    // Check initial status
    window.electronAPI.backend.isLogStreaming().then(setIsStreaming)

    // Listen to logs
    const unsubscribe = window.electronAPI.backend.onLog((log) => {
      setLogs((prev) => [...prev, log])
    })

    return unsubscribe
  }, [])

  return { logs, isStreaming, startStreaming, stopStreaming, clearLogs }
}
```

## React Component Example

```typescript
export const LogViewer = () => {
  const { logs, isStreaming, startStreaming, stopStreaming, clearLogs } = useBackendLogs()

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <button onClick={isStreaming ? stopStreaming : startStreaming}>
          {isStreaming ? 'Stop' : 'Start'} Streaming
        </button>
        <button onClick={clearLogs}>Clear</button>
        <span>{isStreaming ? '🟢' : '🔴'}</span>
      </div>

      <div className="bg-black text-green-400 p-4 h-96 overflow-y-auto font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i} className={`log-${log.level}`}>
            [{log.level}] {log.message}
          </div>
        ))}
      </div>
    </div>
  )
}
```
