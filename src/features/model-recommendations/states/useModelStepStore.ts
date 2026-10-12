import type { Key } from 'react-aria-components'
import { create } from 'zustand'

/** The section and model the user picked on the Model step. Not persisted. */
export interface ModelStepState {
  pickedSectionId?: Key
  pickedModelId?: string
}

export const useModelStepStore = create<ModelStepState>()(() => ({}))

export const MODEL_STEP_ACTIONS = {
  pickSection: (pickedSectionId: Key) =>
    useModelStepStore.setState({ pickedSectionId }),
  pickModel: (pickedModelId: string) =>
    useModelStepStore.setState({ pickedModelId }),
  reset: () =>
    useModelStepStore.setState({
      pickedSectionId: undefined,
      pickedModelId: undefined
    })
}
