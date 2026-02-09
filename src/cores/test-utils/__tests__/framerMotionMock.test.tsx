import { render, screen } from '@testing-library/react'
import { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'

import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  MotionGlobalConfig,
  domAnimation,
  domMax,
  m,
  motion
} from '../framerMotionMock'

describe('framerMotionMock', () => {
  it('renders motion proxy components as matching html tags', () => {
    render(
      <>
        <motion.div data-testid="motion-div">A</motion.div>
        <m.span data-testid="motion-span">B</m.span>
      </>
    )

    expect(screen.getByTestId('motion-div').tagName).toBe('DIV')
    expect(screen.getByTestId('motion-span').tagName).toBe('SPAN')
  })

  it('returns children for wrapper mocks', () => {
    const child = <div>wrapped content</div>

    const withAnimatePresence = AnimatePresence({ children: child })
    const withLazyMotion = LazyMotion({ children: child })
    const withMotionConfig = MotionConfig({ children: child })
    const withMotionGlobalConfig = MotionGlobalConfig({ children: child })
    render(
      <>
        {withAnimatePresence as ReactElement}
        {withLazyMotion as ReactElement}
        {withMotionConfig as ReactElement}
        {withMotionGlobalConfig as ReactElement}
      </>
    )

    expect(screen.getAllByText('wrapped content')).toHaveLength(4)
  })

  it('exposes domAnimation and domMax objects', () => {
    expect(domAnimation).toEqual({})
    expect(domMax).toEqual({})
  })
})
