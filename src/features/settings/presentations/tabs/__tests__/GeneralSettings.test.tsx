import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneralSettings } from '../GeneralSettings'
import { useGeneralSettings } from '../../../states/useGeneralSettings'

vi.mock('../../../states/useGeneralSettings', () => ({
  useGeneralSettings: vi.fn()
}))

describe('GeneralSettings', () => {
  const mockOnSafetyCheckChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGeneralSettings).mockReturnValue({
      isSafetyCheckEnabled: true,
      onSafetyCheckChange: mockOnSafetyCheckChange
    })
  })

  it('renders with SettingsBase title and description', () => {
    render(<GeneralSettings />)

    expect(screen.getByRole('heading', { name: 'General' })).toBeInTheDocument()
    expect(
      screen.getByText('Configure general application settings')
    ).toBeInTheDocument()
    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  it('renders the safety check switch with the stored value', () => {
    render(<GeneralSettings />)

    expect(screen.getByRole('switch', { name: 'Safety check' })).toBeChecked()
  })

  it('reports the new value when the switch is toggled', async () => {
    const user = userEvent.setup()
    render(<GeneralSettings />)

    await user.click(screen.getByRole('switch', { name: 'Safety check' }))

    expect(mockOnSafetyCheckChange).toHaveBeenCalledWith(false)
  })
})
