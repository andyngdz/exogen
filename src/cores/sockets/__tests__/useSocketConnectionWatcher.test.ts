import {
  reconnectSocket,
  SocketConnectionStatus,
  SocketEvents,
  useSocketConnectionStore,
  useSocketConnectionWatcher,
  useSocketStore
} from '@/cores/sockets'
import { act, renderHook } from '@testing-library/react'
import type { Socket } from 'socket.io-client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type Handler = (data?: unknown) => void

const createFakeSocket = (connected: boolean) => {
  const handlers = new Map<string, Set<Handler>>()

  const fake = {
    connected,
    connect: vi.fn(),
    on: vi.fn((event: string, handler: Handler) => {
      const set = handlers.get(event) ?? new Set<Handler>()
      set.add(handler)
      handlers.set(event, set)
    }),
    off: vi.fn((event: string, handler: Handler) => {
      handlers.get(event)?.delete(handler)
    }),
    emit: (event: string) => {
      act(() => {
        handlers.get(event)?.forEach((handler) => handler())
      })
    }
  }

  return fake
}

const useSocketAs = (fake: ReturnType<typeof createFakeSocket>) => {
  useSocketStore.setState({ socket: fake as unknown as Socket })
}

const status = () => useSocketConnectionStore.getState().status

describe('useSocketConnectionWatcher', () => {
  beforeEach(() => {
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTING,
      lastConnectedAt: undefined
    })
  })

  it('reports connected when the socket connected before the watcher mounted', () => {
    useSocketAs(createFakeSocket(true))

    renderHook(() => useSocketConnectionWatcher())

    expect(status()).toBe(SocketConnectionStatus.CONNECTED)
    expect(useSocketConnectionStore.getState().lastConnectedAt).toBeDefined()
  })

  it('reports connecting until the first connect event', () => {
    const socket = createFakeSocket(false)
    useSocketAs(socket)

    renderHook(() => useSocketConnectionWatcher())
    expect(status()).toBe(SocketConnectionStatus.CONNECTING)

    socket.emit(SocketEvents.CONNECT)
    expect(status()).toBe(SocketConnectionStatus.CONNECTED)
  })

  it('reports disconnected on disconnect and on a failed reconnect', () => {
    const socket = createFakeSocket(true)
    useSocketAs(socket)
    renderHook(() => useSocketConnectionWatcher())

    socket.emit(SocketEvents.DISCONNECT)
    expect(status()).toBe(SocketConnectionStatus.DISCONNECTED)

    socket.emit(SocketEvents.CONNECT)
    socket.emit(SocketEvents.CONNECT_ERROR)
    expect(status()).toBe(SocketConnectionStatus.DISCONNECTED)
  })

  it('reconnectSocket asks the current socket to connect', () => {
    const socket = createFakeSocket(false)
    useSocketAs(socket)

    reconnectSocket()

    expect(socket.connect).toHaveBeenCalledTimes(1)
  })
})
