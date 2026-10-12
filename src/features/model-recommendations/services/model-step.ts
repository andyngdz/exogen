import { ModelStepState } from '@/features/model-recommendations/states/useModelStepStore'
import { ModelRecommendationResponse } from '@/types/api'
import { find, first } from 'es-toolkit/compat'

export class ModelStepService {
  /**
   * The shown section and model: the user's pick while it is in the section,
   * otherwise the backend's default, then the recommended one, then the first.
   */
  toSelection(
    { pickedSectionId, pickedModelId }: ModelStepState,
    data?: ModelRecommendationResponse
  ) {
    const sections = data?.sections ?? []
    const section =
      find(sections, (option) => option.id === pickedSectionId) ??
      find(sections, (option) => option.id === data?.default_section) ??
      first(sections)
    const models = section?.models ?? []
    const model =
      find(models, (option) => option.id === pickedModelId) ??
      find(models, (option) => option.id === data?.default_selected_id) ??
      find(models, (option) => option.is_recommended) ??
      first(models)

    return { sections, section, models, model }
  }
}

export const modelStepService = new ModelStepService()
