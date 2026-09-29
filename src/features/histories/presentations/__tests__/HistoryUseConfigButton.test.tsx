import { render, screen } from '@testing-library/react'
import { HistoryUseConfigButton } from '../HistoryUseConfigButton'
import { HistoryItem } from '@/types'
import { useUseConfig } from '../../states/useUseConfig'
import { userEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('lucide-react', () => ({
  Bolt: () => <div data-testid="bolt-icon" />
}))

vi.mock('../../states/useUseConfig', () => ({
  useUseConfig: vi.fn()
}))

describe('HistoryUseConfigButton', () => {
  const mockOnUseConfig = vi.fn()

  beforeEach(() => {
    vi.mocked(useUseConfig).mockReturnValue({
      onUseConfig: mockOnUseConfig
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render button with tooltip', async () => {
    const mockHistory: HistoryItem = {
      id: 1,
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z',
      prompt: 'Test prompt',
      model: 'test-model',
      config: {
        width: 512,
        height: 512,

        loras: [],
        number_of_images: 1,
        prompt: 'Test prompt',
        negative_prompt: '',
        cfg_scale: 7,
        clip_skip: 2,
        steps: 20,
        seed: -1,
        sampler: 'Euler a',
        styles: []
      },
      generated_images: []
    }

    render(<HistoryUseConfigButton history={mockHistory} />)

    expect(useUseConfig).toHaveBeenCalledWith(mockHistory)
    expect(screen.getByTestId('bolt-icon')).toBeInTheDocument()

    const user = userEvent.setup()
    await user.tab()

    expect(
      screen.getByRole('button', { name: 'Use this config' })
    ).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Use this config'
    )
  })

  it('should call onUseConfig when button is clicked', async () => {
    const mockHistory: HistoryItem = {
      id: 1,
      created_at: '2023-01-01T10:00:00Z',
      updated_at: '2023-01-01T10:00:00Z',
      prompt: 'Test prompt',
      model: 'test-model',
      config: {
        width: 512,
        height: 512,

        loras: [],
        number_of_images: 1,
        prompt: 'Test prompt',
        negative_prompt: '',
        cfg_scale: 7,
        clip_skip: 2,
        steps: 20,
        seed: -1,
        sampler: 'Euler a',
        styles: []
      },
      generated_images: []
    }

    render(<HistoryUseConfigButton history={mockHistory} />)

    await userEvent.click(
      screen.getByRole('button', { name: 'Use this config' })
    )

    expect(mockOnUseConfig).toHaveBeenCalledTimes(1)
  })
})
