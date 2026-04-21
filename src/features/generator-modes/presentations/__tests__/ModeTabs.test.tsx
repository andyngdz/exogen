import { GeneratorMode } from '@/types'
import {
  useGeneratorModeStore,
  useImage2ImageConfigStore
} from '@/features/generators'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModeTabs } from '../ModeTabs'

vi.mock('../Text2ImagePanel', () => ({
  Text2ImagePanel: () => <div data-testid="txt2img-panel" />
}))

vi.mock('../Image2ImagePanel', () => ({
  Image2ImagePanel: () => <div data-testid="img2img-panel" />
}))

vi.mock('@heroui/react', () => ({
  Tabs: ({
    children,
    selectedKey,
    onSelectionChange
  }: {
    children: ReactNode
    selectedKey?: string
    onSelectionChange?: (key: string) => void
  }) => (
    <div>
      <div data-testid="selected-key">{selectedKey}</div>
      <button
        type="button"
        data-testid="select-txt2img"
        onClick={() => onSelectionChange?.(GeneratorMode.TEXT_2_IMAGE)}
      />
      <button
        type="button"
        data-testid="select-img2img"
        onClick={() => onSelectionChange?.(GeneratorMode.IMAGE_2_IMAGE)}
      />
      {children}
    </div>
  ),
  Tab: ({ children }: { children: ReactNode }) => <div>{children}</div>
}))

describe('ModeTabs', () => {
  afterEach(() => {
    useGeneratorModeStore.getState().reset()
    useImage2ImageConfigStore.getState().reset()
    vi.clearAllMocks()
  })

  it('defaults to TEXT_2_IMAGE', () => {
    render(<ModeTabs />)

    expect(screen.getByTestId('selected-key')).toHaveTextContent(
      GeneratorMode.TEXT_2_IMAGE
    )
  })

  it('clears init image when switching to TEXT_2_IMAGE', () => {
    useGeneratorModeStore.getState().setMode(GeneratorMode.IMAGE_2_IMAGE)
    useImage2ImageConfigStore
      .getState()
      .setInitImageBase64('data:image/png;base64,abc')

    render(<ModeTabs />)

    fireEvent.click(screen.getByTestId('select-txt2img'))

    expect(useGeneratorModeStore.getState().mode).toBe(
      GeneratorMode.TEXT_2_IMAGE
    )
    expect(useImage2ImageConfigStore.getState().initImageBase64).toBeUndefined()
  })
})
