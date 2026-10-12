import { UpscalerMethod, UpscalerType } from '@/cores/constants'
import { GeneratorInspectorHires } from '@/features/generator-inspector/presentations/GeneratorInspectorHires'
import { FORM_DEFAULT_VALUES } from '@/features/generators/constants'
import {
  useFormValuesStore,
  useHiresFixEnabledStore
} from '@/features/generators'
import { useGeneratorForm } from '@/features/generators/states/useGeneratorForm'
import { HistoryItem } from '@/types'
import { Button } from '@heroui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FC } from 'react'
import { FormProvider } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUseConfig } from '../useUseConfig'

vi.mock('@/cores/hooks', async (importOriginal) => {
  const option = {
    value: UpscalerType.REAL_ESRGAN_X2_PLUS,
    name: 'Real-ESRGAN x2+',
    description: '',
    suggested_denoise_strength: 0.35,
    method: UpscalerMethod.AI,
    is_recommended: true
  }

  return {
    ...(await importOriginal<typeof import('@/cores/hooks')>()),
    useConfig: () => ({
      upscalers: [
        { method: UpscalerMethod.AI, title: 'AI', options: [option] }
      ],
      upscalerOptions: [option]
    })
  }
})

// History JSON from the backend carries hires_fix: null for a run made with hires off.
const hiresOffHistory = JSON.parse(
  JSON.stringify({
    id: 7,
    model: 'stable-diffusion-v1-5/stable-diffusion-v1-5',
    prompt: 'a lighthouse on a basalt cliff',
    created_at: '2026-10-02T03:35:21Z',
    updated_at: '2026-10-02T03:35:21Z',
    config: { ...FORM_DEFAULT_VALUES, hires_fix: null },
    generated_images: []
  })
) as HistoryItem

const UseConfigHarness: FC = () => {
  const { methods } = useGeneratorForm()
  const { onUseConfig } = useUseConfig(hiresOffHistory)

  return (
    <FormProvider {...methods}>
      <Button onPress={onUseConfig}>Use this config</Button>
      <GeneratorInspectorHires />
    </FormProvider>
  )
}

describe('useUseConfig with hires fix on', () => {
  beforeEach(() => {
    localStorage.clear()
    useHiresFixEnabledStore.setState({ isHiresFixEnabled: false })
    useFormValuesStore.getState().reset()
  })

  it('turns hires fix off for a run made without it, so no upscaler loader is left', async () => {
    const user = userEvent.setup()
    const { container } = render(<UseConfigHarness />)

    await user.click(screen.getByRole('switch'))
    expect(screen.getByText('Upscale factor')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Use this config' }))

    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(container.querySelector('.skeleton')).not.toBeInTheDocument()
  })
})
