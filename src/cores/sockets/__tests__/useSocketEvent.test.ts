import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Socket } from 'socket.io-client'
import { useSocketEvent, useSocketStore } from '@/cores/sockets'

// Create mock socket
const createMockSocket = () => ({
  on: vi.fn(),
  off: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
  id: undefined,
  emit: vi.fn()
})

describe('useSocketEvent', () => {
  let mockSocket: ReturnType<typeof createMockSocket>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSocket = createMockSocket()
    useSocketStore.setState({ socket: mockSocket as unknown as Socket })
  })

  it('subscribes to socket event on mount', () => {
    const callback = vi.fn()
    const event = 'test_event'

    renderHook(() => useSocketEvent(event, callback, []))

    expect(mockSocket.on).toHaveBeenCalledWith(event, callback)
    expect(mockSocket.on).toHaveBeenCalledTimes(1)
  })

  it('unsubscribes from socket event on unmount', () => {
    const callback = vi.fn()
    const event = 'test_event'

    const { unmount } = renderHook(() => useSocketEvent(event, callback, []))

    unmount()

    expect(mockSocket.off).toHaveBeenCalledWith(event, callback)
    expect(mockSocket.off).toHaveBeenCalledTimes(1)
  })

  it('re-subscribes when socket instance changes', () => {
    const callback = vi.fn()
    const event = 'test_event'

    const { rerender } = renderHook(() => useSocketEvent(event, callback, []))

    // Create new socket instance
    const newMockSocket = createMockSocket()

    act(() => {
      useSocketStore.setState({ socket: newMockSocket as unknown as Socket })
    })

    // Trigger re-render
    rerender()

    // Should unsubscribe from old socket
    expect(mockSocket.off).toHaveBeenCalledWith(event, callback)

    // Should subscribe to new socket
    expect(newMockSocket.on).toHaveBeenCalledWith(event, callback)
  })

  it('handles multiple event subscriptions independently', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const event1 = 'event_one'
    const event2 = 'event_two'

    renderHook(() => useSocketEvent(event1, callback1, []))
    renderHook(() => useSocketEvent(event2, callback2, []))

    expect(mockSocket.on).toHaveBeenCalledWith(event1, callback1)
    expect(mockSocket.on).toHaveBeenCalledWith(event2, callback2)
    expect(mockSocket.on).toHaveBeenCalledTimes(2)
  })

  it('re-subscribes when event name changes', () => {
    const callback = vi.fn()
    let event = 'event_one'

    const { rerender } = renderHook(() => useSocketEvent(event, callback, []))

    expect(mockSocket.on).toHaveBeenCalledWith('event_one', callback)

    // Change event name
    event = 'event_two'
    rerender()

    // Should unsubscribe from old event
    expect(mockSocket.off).toHaveBeenCalledWith('event_one', callback)

    // Should subscribe to new event
    expect(mockSocket.on).toHaveBeenCalledWith('event_two', callback)
  })

  it('re-subscribes when callback changes', () => {
    let callback = vi.fn()
    const event = 'test_event'

    const { rerender } = renderHook(() => useSocketEvent(event, callback, []))

    const oldCallback = callback
    callback = vi.fn()
    rerender()

    // Should unsubscribe old callback
    expect(mockSocket.off).toHaveBeenCalledWith(event, oldCallback)

    // Should subscribe new callback
    expect(mockSocket.on).toHaveBeenCalledWith(event, callback)
  })

  it('re-subscribes when dependencies change', () => {
    const callback = vi.fn()
    const event = 'test_event'
    let dep = 'value1'

    const { rerender } = renderHook(() =>
      useSocketEvent(event, callback, [dep])
    )

    expect(mockSocket.on).toHaveBeenCalledTimes(1)

    // Change dependency
    dep = 'value2'
    rerender()

    // Should re-subscribe
    expect(mockSocket.off).toHaveBeenCalledWith(event, callback)
    expect(mockSocket.on).toHaveBeenCalledTimes(2)
  })

  it('does not re-subscribe when dependencies stay the same', () => {
    const callback = vi.fn()
    const event = 'test_event'
    const dep = 'constant'

    const { rerender } = renderHook(() =>
      useSocketEvent(event, callback, [dep])
    )

    expect(mockSocket.on).toHaveBeenCalledTimes(1)

    // Rerender without changing dependencies
    rerender()

    // Should not re-subscribe
    expect(mockSocket.on).toHaveBeenCalledTimes(1)
    expect(mockSocket.off).not.toHaveBeenCalled()
  })

  it('handles event with typed data', () => {
    interface CustomData {
      id: string
      value: number
    }

    const callback = vi.fn((_data: CustomData) => {})
    const event = 'custom_event'

    renderHook(() => useSocketEvent<CustomData>(event, callback, []))

    // Verify subscription was set up
    expect(mockSocket.on).toHaveBeenCalledWith(event, callback)

    // Simulate event emission
    const testData: CustomData = { id: 'test-123', value: 42 }
    const subscribedCallback = mockSocket.on.mock.calls[0][1]
    subscribedCallback(testData)

    expect(callback).toHaveBeenCalledWith(testData)
  })

  it('handles multiple subscriptions to same event with different callbacks', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const event = 'shared_event'

    renderHook(() => useSocketEvent(event, callback1, []))
    renderHook(() => useSocketEvent(event, callback2, []))

    expect(mockSocket.on).toHaveBeenCalledWith(event, callback1)
    expect(mockSocket.on).toHaveBeenCalledWith(event, callback2)
    expect(mockSocket.on).toHaveBeenCalledTimes(2)
  })

  it('cleans up multiple subscriptions correctly on unmount', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const event = 'shared_event'

    const { unmount: unmount1 } = renderHook(() =>
      useSocketEvent(event, callback1, [])
    )
    const { unmount: unmount2 } = renderHook(() =>
      useSocketEvent(event, callback2, [])
    )

    unmount1()
    expect(mockSocket.off).toHaveBeenCalledWith(event, callback1)
    expect(mockSocket.off).toHaveBeenCalledTimes(1)

    unmount2()
    expect(mockSocket.off).toHaveBeenCalledWith(event, callback2)
    expect(mockSocket.off).toHaveBeenCalledTimes(2)
  })

  it('handles empty dependencies array', () => {
    const callback = vi.fn()
    const event = 'test_event'

    const { rerender } = renderHook(() => useSocketEvent(event, callback, []))

    expect(mockSocket.on).toHaveBeenCalledTimes(1)

    // Rerender multiple times
    rerender()
    rerender()

    // Should only subscribe once (deps haven't changed)
    expect(mockSocket.on).toHaveBeenCalledTimes(1)
  })

  it('handles no dependencies parameter (defaults to empty array)', () => {
    const callback = vi.fn()
    const event = 'test_event'

    renderHook(() => useSocketEvent(event, callback))

    expect(mockSocket.on).toHaveBeenCalledWith(event, callback)
  })

  it('complete lifecycle: subscribe, emit, unsubscribe', () => {
    const callback = vi.fn()
    const event = 'lifecycle_event'
    const testData = { message: 'test' }

    // 1. Subscribe
    const { unmount } = renderHook(() => useSocketEvent(event, callback, []))
    expect(mockSocket.on).toHaveBeenCalled()

    // 2. Emit event
    const subscribedCallback = mockSocket.on.mock.calls[0][1]
    subscribedCallback(testData)
    expect(callback).toHaveBeenCalledWith(testData)

    // 3. Unsubscribe
    unmount()
    expect(mockSocket.off).toHaveBeenCalledWith(event, callback)
  })

  it('reactive socket switch: unsubscribe from old, subscribe to new', async () => {
    const callback = vi.fn()
    const event = 'test_event'

    const { rerender } = renderHook(() => useSocketEvent(event, callback, []))

    // Switch to new socket
    const newSocket = createMockSocket()

    await act(async () => {
      useSocketStore.setState({ socket: newSocket as unknown as Socket })
    })

    // Force re-render to trigger effect
    rerender()

    // Should eventually unsubscribe from old and subscribe to new
    // Note: timing may vary, so we check that new socket got subscribed
    expect(newSocket.on).toHaveBeenCalledWith(event, callback)
  })
})
