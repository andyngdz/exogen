import { GenerationPhase } from '@/cores/sockets'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup, render, screen } from '@testing-library/react'
import type { MockInstance } from '@vitest/spy'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PHASE_LABELS } from '../../constants'
import * as useGenerationPhaseModule from '../../states/useGenerationPhase'
import { GenerationPhaseStepper } from '../GenerationPhaseStepper'

expect.extend(matchers)

describe('GenerationPhaseStepper', () => {
  let useGenerationPhaseSpy: MockInstance

  beforeEach(() => {
    useGenerationPhaseSpy = vi.spyOn(
      useGenerationPhaseModule,
      'useGenerationPhase'
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
    cleanup()
  })

  it('renders nothing when isVisible is false', () => {
    useGenerationPhaseSpy.mockReturnValue({
      phases: [],
      current: undefined,
      steps: [],
      isVisible: false
    })

    const { container } = render(<GenerationPhaseStepper />)
    expect(container.firstChild).toBeNull()
  })

  it('renders stepper when isVisible is true', () => {
    useGenerationPhaseSpy.mockReturnValue({
      phases: [GenerationPhase.IMAGE_GENERATION],
      current: GenerationPhase.IMAGE_GENERATION,
      steps: [
        {
          phase: GenerationPhase.IMAGE_GENERATION,
          label: PHASE_LABELS[GenerationPhase.IMAGE_GENERATION]
        }
      ],
      isVisible: true
    })

    render(<GenerationPhaseStepper />)

    expect(screen.getByText('Image Generation')).toBeTruthy()
  })

  it('renders multiple phases', () => {
    useGenerationPhaseSpy.mockReturnValue({
      phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
      current: GenerationPhase.IMAGE_GENERATION,
      steps: [
        {
          phase: GenerationPhase.IMAGE_GENERATION,
          label: PHASE_LABELS[GenerationPhase.IMAGE_GENERATION]
        },
        {
          phase: GenerationPhase.UPSCALING,
          label: PHASE_LABELS[GenerationPhase.UPSCALING]
        }
      ],
      isVisible: true
    })

    render(<GenerationPhaseStepper />)

    expect(screen.getByText('Image Generation')).toBeTruthy()
    expect(screen.getByText('Upscaling')).toBeTruthy()
  })

  it('applies correct styling to container', () => {
    useGenerationPhaseSpy.mockReturnValue({
      phases: [GenerationPhase.IMAGE_GENERATION],
      current: GenerationPhase.IMAGE_GENERATION,
      steps: [
        {
          phase: GenerationPhase.IMAGE_GENERATION,
          label: PHASE_LABELS[GenerationPhase.IMAGE_GENERATION]
        }
      ],
      isVisible: true
    })

    const { container } = render(<GenerationPhaseStepper />)

    const stepper = container.firstChild as HTMLElement
    expect(stepper.className).toContain('fixed')
  })

  it('shows indicator on current phase', () => {
    useGenerationPhaseSpy.mockReturnValue({
      phases: [GenerationPhase.IMAGE_GENERATION, GenerationPhase.UPSCALING],
      current: GenerationPhase.UPSCALING,
      steps: [
        {
          phase: GenerationPhase.IMAGE_GENERATION,
          label: PHASE_LABELS[GenerationPhase.IMAGE_GENERATION]
        },
        {
          phase: GenerationPhase.UPSCALING,
          label: PHASE_LABELS[GenerationPhase.UPSCALING]
        }
      ],
      isVisible: true
    })

    const { container } = render(<GenerationPhaseStepper />)

    const indicators = container.querySelectorAll('.animate-pulse')
    expect(indicators.length).toBe(1)
  })
})
