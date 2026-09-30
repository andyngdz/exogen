import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GeneratorInspector } from '../GeneratorInspector'

vi.mock('@/features/generator-inspector/states/useImageSizeFamilySync', () => ({
  useImageSizeFamilySync: vi.fn()
}))
vi.mock('@/features/generator-config-styles/states', () => ({
  useDefaultStyles: vi.fn()
}))
vi.mock('../basic/GeneratorInspectorBasic', () => ({
  GeneratorInspectorBasic: () => <div>Basic panel</div>
}))
vi.mock('../GeneratorInspectorHires', () => ({
  GeneratorInspectorHires: () => <div>Hires panel</div>
}))
vi.mock('../GeneratorInspectorLora', () => ({
  GeneratorInspectorLora: () => <div>LoRA panel</div>
}))
vi.mock('../GeneratorInspectorStyles', () => ({
  GeneratorInspectorStyles: () => <div>Styles panel</div>
}))

describe('GeneratorInspector', () => {
  it('opens on Basic and switches panels by tab', async () => {
    const user = userEvent.setup()
    render(<GeneratorInspector />)

    expect(screen.getByText('Basic panel')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'LoRA' }))

    expect(screen.getByText('LoRA panel')).toBeInTheDocument()
    expect(screen.queryByText('Basic panel')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Styles' }))

    expect(screen.getByText('Styles panel')).toBeInTheDocument()
  })
})
