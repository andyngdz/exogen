import { useStyleSections } from '@/cores/hooks/useStyleSections'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import type { StyleSection } from '@/types'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorInspectorStyles } from '../GeneratorInspectorStyles'

vi.mock('@/cores/hooks/useStyleSections', () => ({
  useStyleSections: vi.fn()
}))
vi.mock('@/cores/backend-initialization', () => ({
  useBackendUrl: () => 'http://localhost:8000'
}))

const styleSections: StyleSection[] = [
  {
    id: 'photo',
    styles: [
      {
        id: 'cinematic',
        name: 'Cinematic',
        origin: 'Fooocus',
        license: 'GPL',
        positive: 'cinematic still',
        image: 'cinematic.jpg'
      },
      {
        id: 'watercolor',
        name: 'Watercolor',
        origin: 'Fooocus',
        license: 'GPL',
        positive: 'watercolor painting',
        image: 'watercolor.jpg'
      }
    ]
  }
]

describe('GeneratorInspectorStyles', () => {
  beforeEach(() => {
    vi.mocked(useStyleSections).mockReturnValue({
      styleSections,
      styleItems: styleSections[0].styles,
      isLoading: false,
      error: null
    })
  })

  it('selects a style inline, without opening a dialog', async () => {
    const user = userEvent.setup()
    render(<GeneratorInspectorStyles />, {
      wrapper: createGeneratorConfigFormWrapper({ overrides: { styles: [] } })
    })

    expect(screen.getAllByRole('button', { name: 'Cinematic' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Cinematic' }))

    expect(screen.getAllByRole('button', { name: 'Cinematic' })).toHaveLength(2)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('filters styles by the search query', async () => {
    const user = userEvent.setup()
    render(<GeneratorInspectorStyles />, {
      wrapper: createGeneratorConfigFormWrapper({ overrides: { styles: [] } })
    })

    await user.type(screen.getByRole('searchbox'), 'water')

    // The search is debounced, so wait for the list to catch up.
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Cinematic' })
      ).not.toBeInTheDocument()
    })
    expect(
      screen.getByRole('button', { name: 'Watercolor' })
    ).toBeInTheDocument()
  })
})
