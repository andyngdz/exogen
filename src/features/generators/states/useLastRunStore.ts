import { create } from 'zustand'

/**
 * Prompt, seed and steps as submitted. Generated items carry only paths, and
 * the form can change after a run, so the viewer and the failure panel read
 * the run from here.
 */
export interface LastRunState {
  prompt?: string
  seed?: number
  steps?: number
}

export const useLastRunStore = create<LastRunState>()(() => ({}))

export const LAST_RUN_ACTIONS = {
  setLastRun: (prompt: string, seed: number, steps: number) =>
    useLastRunStore.setState({ prompt, seed, steps })
}
