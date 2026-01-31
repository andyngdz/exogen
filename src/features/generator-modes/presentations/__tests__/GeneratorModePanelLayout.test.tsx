import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GeneratorModePanelLayout } from '../GeneratorModePanelLayout'

const actionSpy = vi.fn()

vi.mock('@/features/generator-actions', () => ({
  GeneratorAction: (props: { isGenerateDisabled?: boolean }) => {
    actionSpy(props)
    return <div data-testid="generator-action" />
  }
}))

vi.mock('@/features/generator-prompts', () => ({
  PromptInputs: () => <div data-testid="prompt-inputs" />
}))

describe('GeneratorModePanelLayout', () => {
  it('renders prompt inputs and generator action', () => {
    render(
      <GeneratorModePanelLayout onGenerate={() => undefined}>
        <div>Body</div>
      </GeneratorModePanelLayout>
    )

    expect(screen.getByTestId('prompt-inputs')).toBeInTheDocument()
    expect(screen.getByTestId('generator-action')).toBeInTheDocument()
  })

  it('passes isGenerateDisabled to GeneratorAction', () => {
    render(
      <GeneratorModePanelLayout
        onGenerate={() => undefined}
        isGenerateDisabled={true}
      >
        <div>Body</div>
      </GeneratorModePanelLayout>
    )

    expect(actionSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isGenerateDisabled: true })
    )
  })
})
