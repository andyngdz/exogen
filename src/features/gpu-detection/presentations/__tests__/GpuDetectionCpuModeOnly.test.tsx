import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GpuDetectionCpuModeOnly } from '../GpuDetectionCpuModeOnly'

describe('GpuDetectionCpuModeOnly', () => {
  it('renders CPU mode message', () => {
    render(<GpuDetectionCpuModeOnly onCheckAgain={() => {}} />)

    expect(screen.getByText('CPU Mode Only')).toBeInTheDocument()
    expect(screen.getByText(/ExoGen will run on CPU/)).toBeInTheDocument()
    expect(
      screen.getByText(/Consider installing CUDA drivers/)
    ).toBeInTheDocument()
  })

  it('has correct structure and classes', () => {
    const { container } = render(
      <GpuDetectionCpuModeOnly onCheckAgain={() => {}} />
    )

    const mainDiv = container.firstChild as HTMLElement
    expect(mainDiv).toHaveClass('rounded-md')

    const title = screen.getByText('CPU Mode Only')
    expect(title).toHaveClass('text-lg', 'font-bold')

    const description = screen.getByText(/ExoGen will run on CPU/)
    expect(description).toHaveClass('text-center')
  })

  it('calls onCheckAgain when button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnCheckAgain = vi.fn()

    render(<GpuDetectionCpuModeOnly onCheckAgain={mockOnCheckAgain} />)

    const button = screen.getByText("I've installed CUDA drivers. Check again")
    await user.click(button)

    expect(mockOnCheckAgain).toHaveBeenCalledTimes(1)
  })
})
