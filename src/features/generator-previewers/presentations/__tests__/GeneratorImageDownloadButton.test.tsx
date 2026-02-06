import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GeneratorImageDownloadButton } from '../GeneratorImageDownloadButton'

describe('GeneratorImageDownloadButton', () => {
  it('renders a button with download icon', () => {
    render(<GeneratorImageDownloadButton onDownload={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: 'Download image' })
    ).toBeInTheDocument()
  })

  it('calls onDownload when pressed', () => {
    const onDownload = vi.fn()
    render(<GeneratorImageDownloadButton onDownload={onDownload} />)

    const button = screen.getByRole('button', { name: 'Download image' })
    fireEvent.click(button)

    expect(onDownload).toHaveBeenCalledTimes(1)
  })

  it('stops click event propagation', () => {
    const onDownload = vi.fn()
    const onParentClick = vi.fn()

    render(
      <div onClick={onParentClick}>
        <GeneratorImageDownloadButton onDownload={onDownload} />
      </div>
    )

    const button = screen.getByRole('button', { name: 'Download image' })
    fireEvent.click(button)

    expect(onDownload).toHaveBeenCalledTimes(1)
    expect(onParentClick).not.toHaveBeenCalled()
  })

  it('stops keydown event propagation for Enter key', () => {
    const onDownload = vi.fn()
    const onParentKeyDown = vi.fn()

    render(
      <div onKeyDown={onParentKeyDown}>
        <GeneratorImageDownloadButton onDownload={onDownload} />
      </div>
    )

    const button = screen.getByRole('button', { name: 'Download image' })
    fireEvent.keyDown(button, { key: 'Enter' })

    // React Spectrum buttons stop all keydown event propagation by default
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })

  it('stops keydown event propagation for Space key', () => {
    const onDownload = vi.fn()
    const onParentKeyDown = vi.fn()

    render(
      <div onKeyDown={onParentKeyDown}>
        <GeneratorImageDownloadButton onDownload={onDownload} />
      </div>
    )

    const button = screen.getByRole('button', { name: 'Download image' })
    fireEvent.keyDown(button, { key: ' ' })

    // React Spectrum buttons stop all keydown event propagation by default
    expect(onParentKeyDown).not.toHaveBeenCalled()
  })
})
