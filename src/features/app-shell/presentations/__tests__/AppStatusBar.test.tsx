import { useHardwareMemoryQuery, useHardwareQuery } from '@/cores/api-queries'
import {
  SocketConnectionStatus,
  useSocketConnectionStore
} from '@/cores/sockets'
import { useDownloadWatcherStore } from '@/features/download-watcher/states/useDownloadWatchStore'
import { AcceleratorMemoryDevice } from '@/types'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppStatusBar } from '../AppStatusBar'

vi.mock('@/cores/api-queries', () => ({
  useHardwareQuery: vi.fn(),
  useHardwareMemoryQuery: vi.fn()
}))

const hardware = {
  is_cuda: true,
  cuda_runtime_version: '12.4',
  nvidia_driver_version: '560.94',
  message: '',
  gpus: [
    {
      name: 'RTX 4070',
      memory: 12,
      cuda_compute_capability: '8.9',
      is_primary: true
    }
  ]
}

const mockQueries = (memory?: object) => {
  vi.mocked(useHardwareQuery).mockReturnValue({ data: hardware } as never)
  vi.mocked(useHardwareMemoryQuery).mockReturnValue({ data: memory } as never)
}

describe('AppStatusBar', () => {
  beforeEach(() => {
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTED
    })
    useDownloadWatcherStore.setState({ model_id: undefined, step: undefined })
    mockQueries({
      device: AcceleratorMemoryDevice.CUDA,
      used_bytes: 9.1 * 1024 ** 3,
      total_bytes: 12 * 1024 ** 3
    })
  })

  it('shows backend ready with the GPU and VRAM in use', () => {
    render(<AppStatusBar />)

    expect(screen.getByText('Backend ready')).toBeInTheDocument()
    expect(screen.getByText('RTX 4070 · CUDA 12.4')).toBeInTheDocument()
    expect(screen.getByText('9.1 / 12.0 GB')).toBeInTheDocument()
  })

  it('shows connecting while the socket has not connected yet', () => {
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.CONNECTING
    })

    render(<AppStatusBar />)

    expect(screen.getByText('Connecting to backend')).toBeInTheDocument()
  })

  it('hides GPU and VRAM while the backend is offline', () => {
    useSocketConnectionStore.setState({
      status: SocketConnectionStatus.DISCONNECTED
    })

    render(<AppStatusBar />)

    expect(screen.getByText('Backend offline')).toBeInTheDocument()
    expect(screen.queryByText(/RTX 4070/)).not.toBeInTheDocument()
    expect(screen.queryByText('VRAM')).not.toBeInTheDocument()
  })

  it('hides the VRAM meter without memory data', () => {
    mockQueries(undefined)

    render(<AppStatusBar />)

    expect(screen.queryByText('VRAM')).not.toBeInTheDocument()
  })

  it('shows an active model download', () => {
    useDownloadWatcherStore.setState({
      model_id: 'stabilityai/sdxl-turbo',
      step: {
        model_id: 'stabilityai/sdxl-turbo',
        step: 3,
        total: 7,
        downloaded_size: 42,
        total_downloaded_size: 100,
        phase: 'downloading'
      }
    })

    render(<AppStatusBar />)

    expect(
      screen.getByText('Downloading stabilityai/sdxl-turbo')
    ).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
  })
})
