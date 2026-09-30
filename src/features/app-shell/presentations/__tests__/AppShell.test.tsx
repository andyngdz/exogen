import { useAppShellStore } from '@/features/app-shell/states/useAppShellStore'
import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppShell } from '../AppShell'

vi.mock('../AppRail', () => ({ AppRail: () => <nav>Rail</nav> }))
vi.mock('../AppStatusBar', () => ({
  AppStatusBar: () => <footer>Status</footer>
}))
vi.mock('@/cores/sockets', () => ({ useSocketConnectionWatcher: vi.fn() }))
vi.mock('@/features/model-load-progress/states', () => ({
  useModelLoadProgress: vi.fn()
}))
vi.mock('@/features/settings/presentations/SettingsModal', () => ({
  SettingsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen && <div>Settings modal</div>
}))
vi.mock('@/features/model-search', () => ({
  ModelSearchModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen && <div>Model search modal</div>
}))
vi.mock('@/features/backend-logs', () => ({
  BackendLogDrawer: ({ isOpen }: { isOpen: boolean }) =>
    isOpen && <div>Log drawer</div>
}))

describe('AppShell', () => {
  beforeEach(() => {
    useSettingsStore.setState({ isModalOpen: false })
    useAppShellStore.setState({ isModelSearchOpen: false, isLogsOpen: false })
  })

  it('renders the page between the rail and the status bar', () => {
    render(
      <AppShell>
        <main>Editor</main>
      </AppShell>
    )

    expect(screen.getByText('Rail')).toBeInTheDocument()
    expect(screen.getByText('Editor')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
  })

  it('opens settings when another feature calls openModal', () => {
    render(<AppShell>page</AppShell>)

    act(() => {
      useSettingsStore.getState().openModal(SettingsTab.MODELS)
    })

    expect(screen.getByText('Settings modal')).toBeInTheDocument()
    expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MODELS)
  })

  it('opens model search and logs from the shell store', () => {
    render(<AppShell>page</AppShell>)

    act(() => {
      useAppShellStore.setState({ isModelSearchOpen: true, isLogsOpen: true })
    })

    expect(screen.getByText('Model search modal')).toBeInTheDocument()
    expect(screen.getByText('Log drawer')).toBeInTheDocument()
  })
})
