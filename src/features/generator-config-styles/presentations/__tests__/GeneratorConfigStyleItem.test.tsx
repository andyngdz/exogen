import { GeneratorConfigFormValues } from '@/features/generator-configs/types/generator-config'
import {
  createCapturedGeneratorConfigFormWrapper,
  mockNextImage
} from '@/cores/test-utils'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorConfigStyleItem } from '../GeneratorConfigStyleItem'

vi.mock('next/image', () => mockNextImage())

// Mock the style item data
const mockStyleItem = {
  id: 'test-style-id',
  name: 'Test Style',
  origin: 'Test Origin',
  license: 'MIT',
  positive: 'A test style description',
  image: 'test-style.jpg'
}

const renderStyleItem = (
  defaultValues?: Partial<GeneratorConfigFormValues>
) => {
  const { Wrapper, getMethods } = createCapturedGeneratorConfigFormWrapper({
    overrides: defaultValues
  })

  render(<GeneratorConfigStyleItem styleItem={mockStyleItem} />, {
    wrapper: Wrapper
  })

  return { getMethods }
}

const getTrigger = () => screen.getByRole('button', { name: 'Test Style' })
const getChip = () => screen.getByText('Test Style').closest('.chip')

describe('GeneratorConfigStyleItem', () => {
  it('renders style item information', () => {
    renderStyleItem()

    expect(getTrigger()).toBeInTheDocument()
    expect(screen.getByText('Test Style')).toBeInTheDocument()
  })

  it('shows as not selected when style is not in the form', () => {
    renderStyleItem()

    expect(getChip()).not.toHaveClass('border-accent')
  })

  it('shows as selected when style is in the form', () => {
    renderStyleItem({ styles: ['test-style-id'] })

    expect(getChip()).toHaveClass('border-accent')
  })

  it('adds style to selection when pressed and not selected', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderStyleItem()

    await user.click(getTrigger())

    expect(getMethods().getValues('styles')).toEqual(['test-style-id'])
    expect(getChip()).toHaveClass('border-accent')
  })

  it('removes style from selection when pressed and already selected', async () => {
    const user = userEvent.setup()
    const { getMethods } = renderStyleItem({ styles: ['test-style-id'] })

    await user.click(getTrigger())

    expect(getMethods().getValues('styles')).toEqual([])
    expect(getChip()).not.toHaveClass('border-accent')
  })

  it('handles multiple styles in selection correctly', () => {
    renderStyleItem({
      styles: ['other-style', 'test-style-id', 'another-style']
    })

    expect(getChip()).toHaveClass('border-accent')
  })

  it('previews the style image in a tooltip that ignores pointer events', async () => {
    const user = userEvent.setup()
    renderStyleItem()

    await user.tab()

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveClass('pointer-events-none')
    expect(screen.getByTestId('mock-next-image')).toHaveAttribute(
      'data-alt',
      'Test Style'
    )
  })
})
