import { ModelLoadPhase, SocketEvents } from '@/cores/sockets'
import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelLoadProgressBar } from '../ModelLoadProgressBar'

let capturedHandlers: Record<string, (data: unknown) => void> = {}

vi.mock('@/cores/sockets', async () => {
  const actual = await vi.importActual('@/cores/sockets')
  return {
    ...actual,
    useSocketEvent: vi.fn((event: string, handler: (data: unknown) => void) => {
      capturedHandlers[event] = handler
    })
  }
})

describe('ModelLoadProgressBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    capturedHandlers = {}
  })

  afterEach(() => {
    cleanup()
  })

  it('does not render progress bar when not loading', () => {
    const { queryByRole } = render(<ModelLoadProgressBar />)

    expect(queryByRole('progressbar')).toBeNull()
  })

  it('subscribes to socket events', async () => {
    const { useSocketEvent } = vi.mocked(await import('@/cores/sockets'))

    render(<ModelLoadProgressBar />)

    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.MODEL_LOAD_STARTED,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.MODEL_LOAD_PROGRESS,
      expect.any(Function),
      expect.any(Array)
    )
    expect(useSocketEvent).toHaveBeenCalledWith(
      SocketEvents.MODEL_LOAD_COMPLETED,
      expect.any(Function),
      expect.any(Array)
    )
  })

  it('shows progress when MODEL_LOAD_STARTED event fires', () => {
    const { rerender, getByRole } = render(<ModelLoadProgressBar />)

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_STARTED]({
        model_id: 'model-123'
      })
    })
    rerender(<ModelLoadProgressBar />)

    expect(getByRole('progressbar')).toBeTruthy()
  })

  it('updates progress on MODEL_LOAD_PROGRESS event', () => {
    const { rerender, getByRole } = render(<ModelLoadProgressBar />)

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_STARTED]({
        model_id: 'model-456'
      })
      capturedHandlers[SocketEvents.MODEL_LOAD_PROGRESS]({
        model_id: 'model-456',
        step: 5,
        total: 9,
        phase: ModelLoadPhase.LOADING_MODEL,
        message: 'Loading model weights...'
      })
    })
    rerender(<ModelLoadProgressBar />)

    const progressBar = getByRole('progressbar')
    expect(progressBar).toBeTruthy()
    expect(progressBar.getAttribute('aria-valuenow')).toBe('56')
  })

  it('hides progress on MODEL_LOAD_COMPLETED event', () => {
    const { rerender, getByRole, queryByRole } = render(
      <ModelLoadProgressBar />
    )

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_STARTED]({
        model_id: 'model-789'
      })
    })
    rerender(<ModelLoadProgressBar />)
    expect(getByRole('progressbar')).toBeTruthy()

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_COMPLETED]({
        model_id: 'model-789'
      })
    })
    rerender(<ModelLoadProgressBar />)
    expect(queryByRole('progressbar')).toBeNull()
  })

  it('calculates percentage correctly', () => {
    const { rerender, getByRole } = render(<ModelLoadProgressBar />)

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_STARTED]({ model_id: 'test' })
      capturedHandlers[SocketEvents.MODEL_LOAD_PROGRESS]({
        model_id: 'test',
        step: 1,
        total: 9,
        phase: ModelLoadPhase.INITIALIZATION,
        message: 'Initializing...'
      })
    })
    rerender(<ModelLoadProgressBar />)
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('11')

    act(() => {
      capturedHandlers[SocketEvents.MODEL_LOAD_PROGRESS]({
        model_id: 'test',
        step: 9,
        total: 9,
        phase: ModelLoadPhase.OPTIMIZATION,
        message: 'Complete'
      })
    })
    rerender(<ModelLoadProgressBar />)
    expect(getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100')
  })
})
