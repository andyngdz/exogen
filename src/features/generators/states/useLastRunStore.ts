import { create } from 'zustand'

/**
 * Prompt and seed as submitted. Generated items carry only paths, and the
 * form can change after a run, so the viewer reads the run from here.
 */
export interface LastRunState {
  prompt?: string
  seed?: number
}

export const useLastRunStore = create<LastRunState>()(() => ({}))

export const LAST_RUN_ACTIONS = {
  setLastRun: (prompt: string, seed: number) =>
    useLastRunStore.setState({ prompt, seed })
}
