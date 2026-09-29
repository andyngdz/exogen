import {
  ImageViewMode,
  useImageViewModeStore
} from '@/features/generator-previewers/states/useImageViewModeStore'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorAction } from '../GeneratorAction'

// Mock the GeneratorActionSubmitButton component
vi.mock('../GeneratorActionSubmitButton', () => ({
  GeneratorActionSubmitButton: () => (
    <div data-testid="submit-button-mock">Submit Button</div>
  )
}))

const getViewSelect = () => screen.getByRole('button', { name: /View/ })

describe('GeneratorAction', () => {
  beforeEach(() => {
    useImageViewModeStore.setState({ viewMode: ImageViewMode.GRID })
  })

  it('renders the submit button and the view selector with the current mode', () => {
    render(<GeneratorAction onGenerate={vi.fn()} />)

    expect(screen.getByTestId('submit-button-mock')).toBeInTheDocument()
    expect(getViewSelect()).toHaveTextContent('Grid View')
  })

  it('lists both view modes', async () => {
    const user = userEvent.setup()
    render(<GeneratorAction onGenerate={vi.fn()} />)

    await user.click(getViewSelect())

    expect(
      screen.getByRole('option', { name: 'Grid View' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Slider View' })
    ).toBeInTheDocument()
  })

  it('changes view mode when another option is chosen', async () => {
    const user = userEvent.setup()
    render(<GeneratorAction onGenerate={vi.fn()} />)

    await user.click(getViewSelect())
    await user.click(screen.getByRole('option', { name: 'Slider View' }))

    expect(useImageViewModeStore.getState().viewMode).toBe(ImageViewMode.SLIDER)
    expect(getViewSelect()).toHaveTextContent('Slider View')
  })
})
