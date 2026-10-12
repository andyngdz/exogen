import { EventEmitter } from 'node:events'
import { beforeEach, describe, expect, it, vi } from 'vitest'

class FakeSocket extends EventEmitter {
  timeoutCallback?: () => void
  destroy = vi.fn()
  setTimeout = vi.fn((_ms: number, callback: () => void) => {
    this.timeoutCallback = callback
  })
}

const { mockConnect } = vi.hoisted(() => ({
  mockConnect: vi.fn()
}))

vi.mock('node:net', () => ({
  default: { connect: mockConnect },
  connect: mockConnect
}))

import { isOnline } from '../network'

describe('isOnline', () => {
  let socket: FakeSocket

  beforeEach(() => {
    socket = new FakeSocket()
    mockConnect.mockReset()
    mockConnect.mockReturnValue(socket)
  })

  it('is online when a connection to the uv download host opens', async () => {
    const online = isOnline()
    socket.emit('connect')

    await expect(online).resolves.toBe(true)
    expect(mockConnect).toHaveBeenCalledWith({ host: 'astral.sh', port: 443 })
    expect(socket.destroy).toHaveBeenCalled()
  })

  it('is offline when the connection errors', async () => {
    const online = isOnline()
    socket.emit('error', new Error('connect ENETUNREACH'))

    await expect(online).resolves.toBe(false)
  })

  it('is offline when the connection times out', async () => {
    const online = isOnline()
    socket.timeoutCallback?.()

    await expect(online).resolves.toBe(false)
    expect(socket.setTimeout).toHaveBeenCalledWith(5000, expect.any(Function))
    expect(socket.destroy).toHaveBeenCalled()
  })
})
