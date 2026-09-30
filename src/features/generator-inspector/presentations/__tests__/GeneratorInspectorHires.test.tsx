import { UpscaleFactor, UpscalerType } from '@/cores/constants'
import { createGeneratorConfigFormWrapper } from '@/cores/test-utils'
import { useGeneratorConfigFormats } from '@/features/generator-config-formats/states'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratorInspectorHires } from '../GeneratorInspectorHires'

vi.mock('@/features/generator-config-formats/states', () => ({
  useGeneratorConfigFormats: vi.fn()
}))
vi.mock(
  '@/features/generator-config-hires/presentations/GeneratorConfigHiresFix',
  () => ({ GeneratorConfigHiresFix: () => <div>Hires controls</div> })
)

const onHiresFixToggle = vi.fn()

const renderHires = (isHiresFixEnabled: boolean) => {
  vi.mocked(useGeneratorConfigFormats).mockReturnValue({
    isHiresFixEnabled,
    onHiresFixToggle
  })

  return render(<GeneratorInspectorHires />, {
    wrapper: createGeneratorConfigFormWrapper({
      overrides: {
        width: 832,
        height: 1216,
        hires_fix: {
          upscale_factor: UpscaleFactor.TWO,
          upscaler: UpscalerType.REAL_ESRGAN_X2_PLUS,
          denoising_strength: 0.35,
          steps: 0
        }
      }
    })
  })
}

describe('GeneratorInspectorHires', () => {
  beforeEach(() => {
    onHiresFixToggle.mockClear()
  })

  it('hides the second pass while hires fix is off', async () => {
    const user = userEvent.setup()
    renderHires(false)

    expect(screen.queryByText('Hires controls')).not.toBeInTheDocument()

    await user.click(screen.getByRole('switch'))

    expect(onHiresFixToggle).toHaveBeenCalledWith(true)
  })

  it('shows the controls and the upscaled output size when on', () => {
    renderHires(true)

    expect(screen.getByText('Hires controls')).toBeInTheDocument()
    expect(screen.getByText('832 × 1216 → 1664 × 2432')).toBeInTheDocument()
  })
})
