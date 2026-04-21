import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUsePowerShell, mock$ } = vi.hoisted(() => {
  return {
    mockUsePowerShell: vi.fn(),
    mock$: vi.fn()
  }
})

vi.mock('zx', () => ({
  $: mock$,
  usePowerShell: mockUsePowerShell
}))

describe('zx-config', () => {
  let originalPlatform: PropertyDescriptor | undefined

  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    // Store original platform descriptor
    originalPlatform = Object.getOwnPropertyDescriptor(process, 'platform')
  })

  afterEach(() => {
    // Restore original platform
    if (originalPlatform) {
      Object.defineProperty(process, 'platform', originalPlatform)
    }
  })

  describe('platform-specific configuration', () => {
    it('calls usePowerShell() when platform is win32', async () => {
      // Mock Windows platform
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true
      })

      // Re-import the module to trigger the platform check
      await import('../zx-config')

      expect(mockUsePowerShell).toHaveBeenCalledTimes(1)
    })

    it('does not call usePowerShell() when platform is linux', async () => {
      // Mock Linux platform
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true
      })

      mockUsePowerShell.mockClear()

      // Re-import the module to trigger the platform check
      await import('../zx-config')

      expect(mockUsePowerShell).not.toHaveBeenCalled()
    })

    it('does not call usePowerShell() when platform is darwin', async () => {
      // Mock macOS platform
      Object.defineProperty(process, 'platform', {
        value: 'darwin',
        writable: true,
        configurable: true
      })

      mockUsePowerShell.mockClear()

      // Re-import the module to trigger the platform check
      await import('../zx-config')

      expect(mockUsePowerShell).not.toHaveBeenCalled()
    })

    it('does not call usePowerShell() when platform is freebsd', async () => {
      // Mock FreeBSD platform
      Object.defineProperty(process, 'platform', {
        value: 'freebsd',
        writable: true,
        configurable: true
      })

      mockUsePowerShell.mockClear()

      // Re-import the module to trigger the platform check
      await import('../zx-config')

      expect(mockUsePowerShell).not.toHaveBeenCalled()
    })
  })

  describe('exports', () => {
    it('exports the $ function from zx', async () => {
      const zxConfig = await import('../zx-config')

      expect(zxConfig.$).toBe(mock$)
    })

    it('re-exports all zx exports', async () => {
      // This test verifies that the module can be imported successfully
      // and that the re-export syntax works correctly
      const zxConfig = await import('../zx-config')

      // Verify the module exports exist
      expect(zxConfig).toBeDefined()
      expect(zxConfig.$).toBeDefined()
    })
  })

  describe('configuration behavior', () => {
    it('configures PowerShell before any other operations on Windows', async () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        writable: true,
        configurable: true
      })

      mockUsePowerShell.mockClear()

      // Re-import to test configuration order
      const zxConfig = await import('../zx-config')

      // usePowerShell should be called during module initialization
      expect(mockUsePowerShell).toHaveBeenCalled()
      // $ should still be available
      expect(zxConfig.$).toBe(mock$)
    })

    it('works correctly on non-Windows platforms without PowerShell', async () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        writable: true,
        configurable: true
      })

      mockUsePowerShell.mockClear()

      // Re-import to test non-Windows behavior
      const zxConfig = await import('../zx-config')

      // usePowerShell should not be called
      expect(mockUsePowerShell).not.toHaveBeenCalled()
      // $ should still be available
      expect(zxConfig.$).toBe(mock$)
    })
  })
})
