import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import userEvent from '@testing-library/user-event'

import { ModelSearchViewDownloadedButton } from '../ModelSearchViewDownloadedButton'
import { useAppShellStore } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import {
  SettingsTab,
  useSettingsStore
} from '@/features/settings/states/useSettingsStore'

describe('ModelSearchViewDownloadedButton', () => {
  beforeEach(() => {
    useAppShellStore.setState({
      activeView: AppView.GENERATE,
      isModelSearchOpen: true
    })
    useSettingsStore.setState({ selectedTab: SettingsTab.GENERAL })
  })

  describe('Rendering', () => {
    it('renders an outline button with correct text', () => {
      // Arrange & Act
      render(<ModelSearchViewDownloadedButton />)

      // Assert
      const button = screen.getByRole('button', { name: 'Manage this model' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('button--outline')
    })

    it('renders as a button element', () => {
      render(<ModelSearchViewDownloadedButton />)

      const button = screen.getByRole('button', { name: 'Manage this model' })
      expect(button.tagName).toBe('BUTTON')
    })
  })

  describe('User Interaction', () => {
    it('closes model search and opens Model management in Settings', async () => {
      const user = userEvent.setup()
      render(<ModelSearchViewDownloadedButton />)

      await user.click(
        screen.getByRole('button', { name: 'Manage this model' })
      )

      expect(useAppShellStore.getState()).toMatchObject({
        activeView: AppView.SETTINGS,
        isModelSearchOpen: false
      })
      expect(useSettingsStore.getState().selectedTab).toBe(SettingsTab.MODELS)
    })
  })
})
