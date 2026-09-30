import {
  APP_SHELL_ACTIONS,
  useAppShellStore
} from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
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
vi.mock('@/features/settings/presentations/SettingsView', () => ({
  SettingsView: () => <div>Settings view</div>
}))
vi.mock('@/features/model-search/presentations/ModelsView', () => ({
  ModelsView: () => <div>Models view</div>
}))
vi.mock('@/features/histories/presentations/HistoryView', () => ({
  HistoryView: () => <div>History view</div>
}))
vi.mock('@/features/backend-logs/presentations/BackendLogView', () => ({
  BackendLogView: () => <div>Logs view</div>
}))

describe('AppShell', () => {
  beforeEach(() => {
    useAppShellStore.setState({ activeView: AppView.GENERATE })
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

  it('shows Settings over a hidden, still mounted generator', () => {
    render(
      <AppShell>
        <main>Editor</main>
      </AppShell>
    )

    act(() => {
      APP_SHELL_ACTIONS.openSettings(SettingsTab.MODELS)
    })

    expect(screen.getByText('Settings view')).toBeInTheDocument()
    expect(screen.getByText('Editor').parentElement).toHaveClass('hidden')
    expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MODELS)

    act(() => {
      APP_SHELL_ACTIONS.setView(AppView.GENERATE)
    })

    expect(screen.queryByText('Settings view')).not.toBeInTheDocument()
    expect(screen.getByText('Editor').parentElement).not.toHaveClass('hidden')
  })

  it.each([
    [AppView.MODELS, 'Models view'],
    [AppView.HISTORY, 'History view'],
    [AppView.LOGS, 'Logs view']
  ])('shows the %s view', (view, text) => {
    render(<AppShell>page</AppShell>)

    act(() => {
      APP_SHELL_ACTIONS.setView(view)
    })

    expect(screen.getByText(text)).toBeInTheDocument()
  })
})
