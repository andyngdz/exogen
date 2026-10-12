import { useModelRecommendationsQuery } from '@/cores/api-queries'
import { useDownloadWatcherStore } from '@/features/download-watcher'
import { api } from '@/services'
import { ModelRecommendationResponse } from '@/types/api'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ModelRecommendations } from '../ModelRecommendations'

const replace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: vi.fn(), replace })
}))
vi.mock('@/cores/api-queries', () => ({
  useModelRecommendationsQuery: vi.fn()
}))
vi.mock('@/services', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services')>()),
  api: { downloadModel: vi.fn() }
}))
vi.mock('@/features/setup-layout/presentations/OnboardingLayout', () => ({
  OnboardingLayout: ({
    title,
    children,
    footer
  }: {
    title: string
    children: ReactNode
    footer: ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
      {footer}
    </div>
  )
}))

const model = (id: string, name: string, isRecommended = false) => ({
  id,
  name,
  description: `${name} description`,
  memory_requirement_gb: 8,
  model_size: '6.9 GB',
  tags: ['SDXL'],
  is_recommended: isRecommended
})

const data: ModelRecommendationResponse = {
  default_section: 'mid',
  default_selected_id: 'juggernaut',
  sections: [
    {
      id: 'low',
      name: '4 GB VRAM',
      description: '',
      is_recommended: false,
      models: [model('sd15', 'Stable Diffusion 1.5')]
    },
    {
      id: 'mid',
      name: '8 GB VRAM',
      description: '',
      is_recommended: true,
      models: [
        model('juggernaut', 'Juggernaut XL v9', true),
        model('turbo', 'SDXL Turbo')
      ]
    }
  ]
}

describe('ModelRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useDownloadWatcherStore.setState({ model_id: undefined })
    vi.mocked(useModelRecommendationsQuery).mockReturnValue({
      data
    } as unknown as ReturnType<typeof useModelRecommendationsQuery>)
  })

  it('opens on the default group with the backend pick selected', () => {
    render(<ModelRecommendations />)

    expect(screen.getByRole('radio', { name: '8 GB VRAM' })).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /Juggernaut XL v9/ })
    ).toBeChecked()
    expect(
      screen.getByRole('button', { name: /Download Juggernaut XL v9/ })
    ).toBeInTheDocument()
  })

  it('downloads the picked model', async () => {
    const user = userEvent.setup()
    vi.mocked(api.downloadModel).mockResolvedValue(undefined)
    render(<ModelRecommendations />)

    await user.click(screen.getByRole('radio', { name: /SDXL Turbo/ }))
    await user.click(
      screen.getByRole('button', { name: /Download SDXL Turbo/ })
    )

    expect(api.downloadModel).toHaveBeenCalledWith('turbo')
  })

  it('switches groups and can skip to the editor', async () => {
    const user = userEvent.setup()
    render(<ModelRecommendations />)

    await user.click(screen.getByRole('radio', { name: '4 GB VRAM' }))

    expect(
      screen.getByRole('radio', { name: /Stable Diffusion 1.5/ })
    ).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Skip for now' }))

    expect(replace).toHaveBeenCalledWith('/editor')
  })
})
