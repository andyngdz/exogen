import { useGeneratorConfigForm } from '@/features/generator-configs/states/useGeneratorConfigForm'
import { useGenerationStatusStore } from '@/features/generators/states'

export const useGeneratorActionSubmit = () => {
  const { watch } = useGeneratorConfigForm()
  const isGenerating = useGenerationStatusStore((state) => state.isGenerating)

  return { numberOfImages: watch('number_of_images'), isGenerating }
}
