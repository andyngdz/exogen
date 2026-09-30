import { createStoreSelectorMock } from '@/cores/test-utils'
import {
  LAST_RUN_ACTIONS,
  useFormValuesStore,
  useUseImageGenerationStore
} from '@/features/generators'
import { HistoryItem } from '@/types'
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUseConfig } from '../useUseConfig'

vi.mock('@/features/generators', () => ({
  useFormValuesStore: vi.fn(),
  useUseImageGenerationStore: vi.fn(),
  LAST_RUN_ACTIONS: { setLastRun: vi.fn() }
}))

const history: HistoryItem = {
  id: 1,
  model: 'test-model',
  prompt: 'a lighthouse in heavy rain',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  config: {
    width: 512,
    height: 512,
    loras: [],
    number_of_images: 1,
    prompt: 'a lighthouse in heavy rain',
    negative_prompt: '',
    cfg_scale: 7,
    clip_skip: 2,
    steps: 20,
    seed: 1193044871,
    sampler: 'Euler a',
    styles: []
  },
  generated_images: [
    {
      id: 1,
      path: 'static/generated_images/image.png',
      is_nsfw: false,
      file_name: 'image.png',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      history_id: 1
    }
  ]
}

describe('useUseConfig', () => {
  const onSetValues = vi.fn()
  const onRestore = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useFormValuesStore).mockImplementation(
      createStoreSelectorMock({ onSetValues })
    )
    vi.mocked(useUseImageGenerationStore).mockImplementation(
      createStoreSelectorMock({ onRestore })
    )
  })

  it('restores the config and images, and records the run for the viewer', () => {
    const { result } = renderHook(() => useUseConfig(history))

    result.current.onUseConfig()

    expect(onSetValues).toHaveBeenCalledWith(history.config)
    expect(onRestore).toHaveBeenCalledWith(history.generated_images)
    expect(LAST_RUN_ACTIONS.setLastRun).toHaveBeenCalledWith(
      'a lighthouse in heavy rain',
      1193044871,
      20
    )
  })
})
