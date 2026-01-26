import '@testing-library/jest-dom/vitest'
import 'core-js/actual'
import type { ReactElement, ReactNode } from 'react'
import { createElement } from 'react'
import { afterEach, beforeEach, vi } from 'vitest'
import 'vitest-localstorage-mock'

/**
 * Global Mocks
 * Setup global mocks that are needed across all tests
 */

// Mock ResizeObserver since jsdom doesn't provide it
class ResizeObserverMock {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)

/**
 * Module Mocks
 * Mock external modules that cause issues in test environment
 */

// Mock framer-motion to prevent window access issues during tests.
// Keep it lightweight: enough for HeroUI internals.
vi.mock('framer-motion', () => {
  const createMotionComponent = (tag: string) => {
    const MotionComponent = ({
      children,
      ...props
    }: Record<string, unknown> & { children?: ReactNode }) =>
      createElement(tag, props, children)

    return MotionComponent
  }

  const motionProxy = new Proxy(
    {},
    {
      get: (_target, prop) => createMotionComponent(String(prop))
    }
  )

  return {
    AnimatePresence: ({ children }: { children: ReactNode }) =>
      children as ReactElement,
    LazyMotion: ({ children }: { children: ReactNode }) =>
      children as ReactElement,
    domAnimation: {},
    domMax: {},
    m: motionProxy,
    motion: motionProxy
  }
})

// Mock react-lottie to prevent canvas context issues during tests
vi.mock('react-lottie', () => ({
  default: () => ({
    type: 'div',
    props: { 'data-testid': 'lottie-animation' },
    children: 'AI Animation'
  })
}))

// Mock lottie animation data
vi.mock('@/assets/ai.json', () => ({
  default: { mockAnimationData: true }
}))

/**
 * ElectronAPI Mock
 * Provides a mock implementation of the Electron API for testing
 */

type ElectronAPI = Window['electronAPI']

const noop = (): void => {}

const createElectronAPIMock = (): ElectronAPI => ({
  downloadImage: vi.fn().mockReturnThis(),
  selectFile: vi.fn().mockResolvedValue(null),
  onBackendSetupStatus: vi.fn().mockReturnValue(noop),
  app: {
    getVersion: vi.fn().mockResolvedValue('0.0.0')
  },
  backend: {
    getPort: vi.fn().mockResolvedValue(8000),
    isLogStreaming: vi.fn().mockResolvedValue(false),
    onLog: vi.fn().mockReturnValue(noop),
    openBackendFolder: vi.fn().mockResolvedValue('')
  },
  updater: {
    checkForUpdates: vi
      .fn()
      .mockResolvedValue({ updateAvailable: false, version: undefined }),
    installUpdate: vi.fn().mockResolvedValue(undefined)
  }
})

/**
 * Test Setup and Cleanup
 * Configure the test environment before and after each test
 */

beforeEach(() => {
  // Setup ElectronAPI mock on window object
  Object.defineProperty(globalThis, 'electronAPI', {
    configurable: true,
    writable: true,
    value: createElectronAPIMock()
  })
})

afterEach(() => {
  // Clean up ElectronAPI mock
  Reflect.deleteProperty(globalThis, 'electronAPI')
})
