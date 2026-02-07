import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GeneratorPreviewTile } from '../GeneratorPreviewTile'

describe('GeneratorPreviewTile', () => {
  it('renders children content', () => {
    render(
      <GeneratorPreviewTile>
        <span data-testid="child">Child content</span>
      </GeneratorPreviewTile>
    )

    expect(screen.getByTestId('child')).toHaveTextContent('Child content')
  })

  it('applies custom className', () => {
    render(
      <GeneratorPreviewTile className="custom-class">
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('applies aspect ratio style when provided', () => {
    render(
      <GeneratorPreviewTile aspectRatio={16 / 9}>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveStyle({ aspectRatio: 16 / 9 })
  })

  it('does not apply aspect ratio style when not provided', () => {
    render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const container = screen.getByText('Content').parentElement
    expect(container?.style.aspectRatio).toBe('')
  })

  it('renders topRight slot when provided', () => {
    render(
      <GeneratorPreviewTile topRight={<button>Action</button>}>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('does not render topRight container when not provided', () => {
    const { container } = render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    // Should only have one child (the content), no absolute positioned divs
    const absoluteDivs = container.querySelectorAll('.absolute')
    expect(absoluteDivs).toHaveLength(0)
  })

  it('applies topRightClassName to topRight container', () => {
    render(
      <GeneratorPreviewTile
        topRight={<button>Action</button>}
        topRightClassName="opacity-50"
      >
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const button = screen.getByRole('button', { name: 'Action' })
    expect(button.parentElement).toHaveClass('opacity-50')
  })

  it('renders bottomOverlay slot when provided', () => {
    render(
      <GeneratorPreviewTile bottomOverlay={<span>Overlay text</span>}>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    expect(screen.getByText('Overlay text')).toBeInTheDocument()
  })

  it('does not render bottomOverlay container when not provided', () => {
    const { container } = render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const absoluteDivs = container.querySelectorAll('.absolute')
    expect(absoluteDivs).toHaveLength(0)
  })

  it('applies bottomOverlayClassName to bottomOverlay container', () => {
    render(
      <GeneratorPreviewTile
        bottomOverlay={<span data-testid="overlay">Overlay</span>}
        bottomOverlayClassName="bg-black/50"
      >
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const overlay = screen.getByTestId('overlay')
    expect(overlay.parentElement).toHaveClass('bg-black/50')
  })

  it('renders both topRight and bottomOverlay when both are provided', () => {
    render(
      <GeneratorPreviewTile
        topRight={<button>Top action</button>}
        bottomOverlay={<span>Bottom overlay</span>}
      >
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    expect(
      screen.getByRole('button', { name: 'Top action' })
    ).toBeInTheDocument()
    expect(screen.getByText('Bottom overlay')).toBeInTheDocument()
  })

  it('has correct base styling classes', () => {
    render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const container = screen.getByText('Content').parentElement
    expect(container).toHaveClass('relative')
    expect(container).toHaveClass('group')
    expect(container).toHaveClass('h-full')
    expect(container).toHaveClass('w-full')
    expect(container).toHaveClass('overflow-hidden')
    expect(container).toHaveClass('rounded-2xl')
    expect(container).toHaveClass('bg-content1')
  })

  it('behaves as a button when onPress is provided', () => {
    const onPress = vi.fn()

    render(
      <GeneratorPreviewTile onPress={onPress} ariaLabel="Open tile">
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const tile = screen.getByRole('button', { name: 'Open tile' })
    tile.click()
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('triggers onPress when Enter key is pressed', () => {
    const onPress = vi.fn()

    render(
      <GeneratorPreviewTile onPress={onPress} ariaLabel="Open tile">
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    fireEvent.keyDown(screen.getByRole('button', { name: 'Open tile' }), {
      key: 'Enter'
    })

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('triggers onPress and prevents default when Space key is pressed', () => {
    const onPress = vi.fn()

    render(
      <GeneratorPreviewTile onPress={onPress} ariaLabel="Open tile">
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const tile = screen.getByRole('button', { name: 'Open tile' })
    const keyboardEvent = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true
    })

    tile.dispatchEvent(keyboardEvent)

    expect(onPress).toHaveBeenCalledTimes(1)
    expect(keyboardEvent.defaultPrevented).toBe(true)
  })

  it('does not trigger onPress for non-activation keys', () => {
    const onPress = vi.fn()

    render(
      <GeneratorPreviewTile onPress={onPress} ariaLabel="Open tile">
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    fireEvent.keyDown(screen.getByRole('button', { name: 'Open tile' }), {
      key: 'Escape'
    })

    expect(onPress).not.toHaveBeenCalled()
  })

  it('does not expose button semantics when onPress is missing', () => {
    render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const tile = screen.getByText('Content').parentElement
    expect(tile).not.toHaveAttribute('role')
    expect(tile).not.toHaveAttribute('tabindex')
    expect(tile).not.toHaveClass('cursor-zoom-in')
  })

  it('ignores keyboard events when onPress is not provided', () => {
    render(
      <GeneratorPreviewTile>
        <span>Content</span>
      </GeneratorPreviewTile>
    )

    const tile = screen.getByText('Content').parentElement
    expect(tile).not.toBeNull()

    const keyboardEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true
    })

    tile?.dispatchEvent(keyboardEvent)

    expect(keyboardEvent.defaultPrevented).toBe(false)
  })
})
