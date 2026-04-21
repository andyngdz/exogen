import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackendLogCollector } from '../BackendLogCollector'

vi.mock('../../states/useBackendLogCollector', () => ({
  useBackendLogCollector: vi.fn()
}))

import { useBackendLogCollector } from '../../states/useBackendLogCollector'

const mockUseBackendLogCollector = vi.mocked(useBackendLogCollector)

describe('BackendLogCollector', () => {
  it('calls useBackendLogCollector and renders children', () => {
    const { getByText } = render(
      <BackendLogCollector>
        <div>Child content</div>
      </BackendLogCollector>
    )

    expect(mockUseBackendLogCollector).toHaveBeenCalled()
    expect(getByText('Child content')).toBeInTheDocument()
  })
})
