import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Image2ImagePanel } from '../Image2ImagePanel'

const layoutSpy = vi.fn()
const previewerSpy = vi.fn()
const img2imgConfigState: { initImageBase64?: string } = {
  initImageBase64: undefined
}

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    handleSubmit: vi.fn((fn: unknown) => fn)
  })
}))

vi.mock('@/features/generators', () => ({
  useImage2ImageGenerator: () => ({ onGenerate: vi.fn() }),
  useImage2ImageConfigStore: () => img2imgConfigState
}))

vi.mock('../GeneratorModePanelLayout', () => ({
  GeneratorModePanelLayout: (props: {
    onGenerate: VoidFunction
    isGenerateDisabled?: boolean
    children: React.ReactNode
  }) => {
    layoutSpy(props)
    return <div data-testid="layout">{props.children}</div>
  }
}))

vi.mock('@/features/generator-previewers', () => ({
  GeneratorPreviewer: (props: { leadingItem?: React.ReactNode }) => {
    previewerSpy(props)
    return <div data-testid="previewer" />
  }
}))

vi.mock('@/features/generator-image-input/presentations/ImageInput', () => ({
  ImageInput: () => <div data-testid="image-input" />
}))

describe('Image2ImagePanel', () => {
  afterEach(() => {
    img2imgConfigState.initImageBase64 = undefined
    layoutSpy.mockClear()
    previewerSpy.mockClear()
  })

  it('disables generate when init image is missing', () => {
    render(<Image2ImagePanel />)

    const call = layoutSpy.mock.calls[0]?.[0] as
      | { isGenerateDisabled?: boolean }
      | undefined

    expect(call?.isGenerateDisabled).toBe(true)
  })

  it('enables generate when init image exists', () => {
    img2imgConfigState.initImageBase64 = 'data:image/png;base64,abc'

    render(<Image2ImagePanel />)

    const call = layoutSpy.mock.calls[0]?.[0] as
      | { isGenerateDisabled?: boolean }
      | undefined

    expect(call?.isGenerateDisabled).toBe(false)
  })

  it('passes ImageInput as GeneratorPreviewer leadingItem', () => {
    render(<Image2ImagePanel />)

    expect(previewerSpy).toHaveBeenCalledWith(
      expect.objectContaining({ leadingItem: expect.anything() })
    )
  })

  it('passes onGenerate callback to layout', () => {
    render(<Image2ImagePanel />)

    const call = layoutSpy.mock.calls[0]?.[0] as
      | { onGenerate: unknown }
      | undefined

    expect(call?.onGenerate).toBeDefined()
    expect(typeof call?.onGenerate).toBe('function')
  })

  it('renders GeneratorPreviewer inside layout', () => {
    const { getByTestId } = render(<Image2ImagePanel />)

    expect(getByTestId('layout')).toBeInTheDocument()
    expect(getByTestId('previewer')).toBeInTheDocument()
  })
})
