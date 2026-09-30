import { useHistoriesQuery } from '@/cores/api-queries'
import { useAppShellStore } from '@/features/app-shell/states/useAppShellStore'
import { AppView } from '@/features/app-shell/types'
import { HistoryItem } from '@/types'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryView } from '../HistoryView'

vi.mock('@/cores/api-queries', () => ({ useHistoriesQuery: vi.fn() }))
vi.mock('../HistoryRunDetail', () => ({
  HistoryRunDetail: ({ history }: { history: HistoryItem }) => (
    <aside>Detail: {history.prompt}</aside>
  )
}))
vi.mock('../HistoryRunCard', () => ({
  HistoryRunCard: ({
    history,
    onSelect
  }: {
    history: HistoryItem
    onSelect: VoidFunction
  }) => <button onClick={onSelect}>{history.prompt}</button>
}))

const run = (id: number, prompt: string) =>
  ({
    id,
    prompt,
    created_at: `2026-10-01T0${id}:00:00`,
    config: { width: 512, height: 512 },
    generated_images: []
  }) as unknown as HistoryItem

const refetch = vi.fn()

const mockHistories = (data: HistoryItem[], error: Error | null = null) =>
  vi.mocked(useHistoriesQuery).mockReturnValue({
    data,
    isLoading: false,
    error,
    refetch
  } as unknown as ReturnType<typeof useHistoriesQuery>)

describe('HistoryView', () => {
  beforeEach(() => {
    useAppShellStore.setState({ activeView: AppView.HISTORY })
  })

  it('selects the newest run, then the one picked', async () => {
    const user = userEvent.setup()
    mockHistories([run(1, 'a forest'), run(2, 'a lighthouse')])
    render(<HistoryView />)

    expect(screen.getByText('2 runs')).toBeInTheDocument()
    expect(screen.getByText('Detail: a lighthouse')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'a forest' }))

    expect(screen.getByText('Detail: a forest')).toBeInTheDocument()
  })

  it('narrows the runs with the prompt search', async () => {
    const user = userEvent.setup()
    mockHistories([run(1, 'a forest'), run(2, 'a lighthouse')])
    render(<HistoryView />)

    await user.type(
      screen.getByRole('searchbox', { name: 'Search prompts' }),
      'forest'
    )

    expect(
      screen.queryByRole('button', { name: 'a lighthouse' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Detail: a forest')).toBeInTheDocument()
  })

  it('points to Generate when there are no runs', async () => {
    const user = userEvent.setup()
    mockHistories([])
    render(<HistoryView />)

    expect(screen.getByText('No runs yet')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Go to Generate' }))

    expect(useAppShellStore.getState().activeView).toBe(AppView.GENERATE)
  })

  it('reports a failed load instead of an empty history', async () => {
    const user = userEvent.setup()
    mockHistories([], new Error('Network Error'))
    render(<HistoryView />)

    expect(screen.getByText('History did not load')).toBeInTheDocument()
    expect(screen.getByText('Network Error')).toBeInTheDocument()
    expect(screen.queryByText('No runs yet')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refetch).toHaveBeenCalled()
  })
})
