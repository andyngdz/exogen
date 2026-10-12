import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EditorScreen from '../page'

vi.mock('@/features/editors/presentations/Editor', () => ({
  Editor: () => <div data-testid="editor">Editor Component</div>
}))

vi.mock('@/features/app-shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  )
}))

describe('EditorScreen', () => {
  it('renders the editor inside the app shell', () => {
    render(<EditorScreen />)

    expect(screen.getByTestId('app-shell')).toContainElement(
      screen.getByTestId('editor')
    )
  })
})
