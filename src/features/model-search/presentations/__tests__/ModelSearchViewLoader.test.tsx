import { render, screen } from '@testing-library/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ModelSearchViewLoader } from '../ModelSearchViewLoader'

vi.mock('@heroui/react', () => {
  const ScrollShadow = ({
    children,
    hideScrollBar: _hideScrollBar,
    ...props
  }: {
    children: ReactNode
    hideScrollBar?: boolean
  } & HTMLAttributes<HTMLDivElement>) => (
    <div data-testid="scroll-shadow" {...props}>
      {children}
    </div>
  )

  const Skeleton = ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  )

  return { ScrollShadow, Skeleton }
})

describe('ModelSearchViewLoader', () => {
  it('renders loader layout with expected skeleton counts', () => {
    const { container } = render(<ModelSearchViewLoader />)

    const root = container.firstElementChild
    expect(root).toHaveClass('flex', 'flex-col', 'gap-2', 'h-full')

    const scrollShadows = screen.getAllByTestId('scroll-shadow')
    expect(scrollShadows).toHaveLength(2)

    const skeletons = screen.getAllByTestId('skeleton')
    expect(skeletons).toHaveLength(50)
  })
})
