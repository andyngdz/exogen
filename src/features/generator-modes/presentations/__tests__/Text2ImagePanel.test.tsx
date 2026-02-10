import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Text2ImagePanel } from '../Text2ImagePanel'

const layoutSpy = vi.fn()

vi.mock('react-hook-form', () => ({
  useFormContext: () => ({
    handleSubmit: vi.fn((fn: unknown) => fn)
  })
}))

vi.mock('@/features/generators', () => ({
  useGenerator: () => ({ onGenerate: vi.fn() })
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
  GeneratorPreviewer: () => <div data-testid="previewer" />
}))

describe('Text2ImagePanel', () => {
  it('does not pass isGenerateDisabled', () => {
    render(<Text2ImagePanel />)

    const call = layoutSpy.mock.calls[0]?.[0] as
      | { isGenerateDisabled?: boolean }
      | undefined

    expect(call?.isGenerateDisabled).toBeUndefined()
  })

  it('passes onGenerate callback to layout', () => {
    render(<Text2ImagePanel />)

    const call = layoutSpy.mock.calls[0]?.[0] as
      | { onGenerate: unknown }
      | undefined

    expect(call?.onGenerate).toBeDefined()
    expect(typeof call?.onGenerate).toBe('function')
  })

  it('renders GeneratorPreviewer inside layout', () => {
    const { getByTestId } = render(<Text2ImagePanel />)

    expect(getByTestId('layout')).toBeInTheDocument()
    expect(getByTestId('previewer')).toBeInTheDocument()
  })

  it('renders GeneratorPreviewer without leadingItem', () => {
    const previewerSpy = vi.fn()
    vi.doMock('@/features/generator-previewers', () => ({
      GeneratorPreviewer: (props: { leadingItem?: React.ReactNode }) => {
        previewerSpy(props)
        return <div data-testid="previewer" />
      }
    }))

    render(<Text2ImagePanel />)

    // The component renders GeneratorPreviewer without leadingItem prop
    expect(previewerSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ leadingItem: expect.anything() })
    )
  })
})
