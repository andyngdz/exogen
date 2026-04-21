import { act, renderHook } from '@testing-library/react'
import type { LogEntry } from '@types'
import { beforeEach, describe, expect, it } from 'vitest'
import { MAX_LOGS, useBackendLogStore } from '../useBackendLogStore'

describe('useBackendLogStore', () => {
  beforeEach(() => {
    act(() => {
      useBackendLogStore.setState({ logs: [], isStreaming: false })
    })
  })

  describe('Initial State', () => {
    it('should have empty logs array', () => {
      const { result } = renderHook(() => useBackendLogStore())
      expect(result.current.logs).toEqual([])
    })

    it('should have isStreaming set to false', () => {
      const { result } = renderHook(() => useBackendLogStore())
      expect(result.current.isStreaming).toBe(false)
    })
  })

  describe('addLog', () => {
    it('should add a log entry', () => {
      const { result } = renderHook(() => useBackendLogStore())
      const logEntry: LogEntry = {
        timestamp: Date.now(),
        level: 'info',
        message: 'Test log message'
      }

      act(() => {
        result.current.addLog(logEntry)
      })

      expect(result.current.logs).toHaveLength(1)
      expect(result.current.logs[0]).toEqual(logEntry)
    })

    it('should add multiple log entries', () => {
      const { result } = renderHook(() => useBackendLogStore())
      const log1: LogEntry = {
        timestamp: Date.now(),
        level: 'info',
        message: 'First log'
      }
      const log2: LogEntry = {
        timestamp: Date.now() + 1000,
        level: 'warn',
        message: 'Second log'
      }

      act(() => {
        result.current.addLog(log1)
        result.current.addLog(log2)
      })

      expect(result.current.logs).toHaveLength(2)
      expect(result.current.logs[0]).toEqual(log1)
      expect(result.current.logs[1]).toEqual(log2)
    })

    it('should maintain only MAX_LOGS entries', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        for (let i = 0; i < MAX_LOGS + 50; i++) {
          result.current.addLog({
            timestamp: Date.now() + i,
            level: 'info',
            message: `Log ${i}`
          })
        }
      })

      expect(result.current.logs).toHaveLength(MAX_LOGS)
    })

    it('should keep the most recent logs when exceeding MAX_LOGS', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        for (let i = 0; i < MAX_LOGS + 10; i++) {
          result.current.addLog({
            timestamp: Date.now() + i,
            level: 'info',
            message: `Log ${i}`
          })
        }
      })

      expect(result.current.logs).toHaveLength(MAX_LOGS)
      expect(result.current.logs[0].message).toBe('Log 10')
      expect(result.current.logs[MAX_LOGS - 1].message).toBe(
        `Log ${MAX_LOGS + 9}`
      )
    })
  })

  describe('clearLogs', () => {
    it('should clear all logs', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        result.current.addLog({
          timestamp: Date.now(),
          level: 'info',
          message: 'Test log'
        })
        result.current.addLog({
          timestamp: Date.now() + 1000,
          level: 'error',
          message: 'Error log'
        })
      })

      expect(result.current.logs).toHaveLength(2)

      act(() => {
        result.current.clearLogs()
      })

      expect(result.current.logs).toEqual([])
    })

    it('should not affect isStreaming state', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        result.current.setIsStreaming(true)
        result.current.addLog({
          timestamp: Date.now(),
          level: 'info',
          message: 'Test log'
        })
        result.current.clearLogs()
      })

      expect(result.current.logs).toEqual([])
      expect(result.current.isStreaming).toBe(true)
    })
  })

  describe('setIsStreaming', () => {
    it('should set isStreaming to true', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        result.current.setIsStreaming(true)
      })

      expect(result.current.isStreaming).toBe(true)
    })

    it('should set isStreaming to false', () => {
      const { result } = renderHook(() => useBackendLogStore())

      act(() => {
        result.current.setIsStreaming(true)
        result.current.setIsStreaming(false)
      })

      expect(result.current.isStreaming).toBe(false)
    })

    it('should not affect logs state', () => {
      const { result } = renderHook(() => useBackendLogStore())
      const logEntry: LogEntry = {
        timestamp: Date.now(),
        level: 'info',
        message: 'Test log'
      }

      act(() => {
        result.current.addLog(logEntry)
        result.current.setIsStreaming(true)
      })

      expect(result.current.logs).toHaveLength(1)
      expect(result.current.logs[0]).toEqual(logEntry)
      expect(result.current.isStreaming).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset the store to its initial state', () => {
      const { result } = renderHook(() => useBackendLogStore())

      // Set some state
      act(() => {
        result.current.addLog({
          timestamp: Date.now(),
          level: 'info',
          message: 'Log before reset'
        })
        result.current.setIsStreaming(true)
      })

      expect(result.current.logs).toHaveLength(1)
      expect(result.current.isStreaming).toBe(true)

      // Reset the state
      act(() => {
        result.current.reset()
      })

      // Verify it's back to initial state
      expect(result.current.logs).toEqual([])
      expect(result.current.isStreaming).toBe(false)
    })
  })
})
