import { createElement } from 'react'
import type { ReactElement, ReactNode } from 'react'

type MotionProps = Record<string, unknown> & { children?: ReactNode }

const createMotionComponent = (tag: string) => {
  const MotionComponent = ({ children, ...props }: MotionProps) =>
    createElement(tag, props, children)

  return MotionComponent
}

const motionProxy = new Proxy(
  {},
  {
    get: (_target, prop) => createMotionComponent(String(prop))
  }
) as Record<string, (props: MotionProps) => ReactElement>

export const AnimatePresence = ({ children }: { children: ReactNode }) =>
  children as ReactElement

export const LazyMotion = ({ children }: { children: ReactNode }) =>
  children as ReactElement

export const MotionConfig = ({ children }: { children: ReactNode }) =>
  children as ReactElement

export const MotionGlobalConfig = ({ children }: { children: ReactNode }) =>
  children as ReactElement

export const domAnimation = {}
export const domMax = {}

export const m = motionProxy
export const motion = motionProxy
