import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'
import { useUpdaterStore } from '@/features/settings/states/useUpdaterStore'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsView } from '../SettingsView'

vi.mock('../tabs', () => ({
  GeneralSettings: () => <div>General section</div>,
  MemorySettings: () => <div>Memory section</div>,
  ModelManagement: () => <div>Models section</div>,
  UpdateSettings: () => <div>Updates section</div>
}))

describe('SettingsView', () => {
  beforeEach(() => {
    useSettingsStore.setState({ selectedTab: SettingsTab.MEMORY })
  })

  it('opens on the selected section and switches from the nav', async () => {
    const user = userEvent.setup()
    render(<SettingsView />)

    expect(screen.getByText('Memory section')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Model management' }))

    expect(screen.getByText('Models section')).toBeInTheDocument()
    expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MODELS)
  })

  it('flags the Updates section while a downloaded update waits', () => {
    useUpdaterStore.setState({ downloadedVersion: '1.20.0' })
    render(<SettingsView />)

    expect(screen.getByRole('tab', { name: /Updates/ })).toHaveTextContent(
      'Update ready'
    )
  })
})
