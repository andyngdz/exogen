import { useBackendUrl } from '@/cores/backend-initialization'
import { useUseImageGenerationStore } from '@/features/generators'
import { map } from 'es-toolkit/compat'
import { useMemo } from 'react'
import type { Swiper } from 'swiper'
import { useGeneratorPhotoviewStore } from './useGeneratorPhotoviewStore'

interface UseGeneratorPhotoviewCarouselModelParams {
  initialIndex: number
}

export const useGeneratorPhotoviewCarouselModel = ({
  initialIndex
}: UseGeneratorPhotoviewCarouselModelParams) => {
  const baseURL = useBackendUrl()
  const items = useUseImageGenerationStore((state) => state.items)
  const currentIndex = useGeneratorPhotoviewStore((state) => state.currentIndex)
  const setCurrentIndex = useGeneratorPhotoviewStore(
    (state) => state.setCurrentIndex
  )

  const hasMultipleImages = items.length > 1

  const safeInitialSlide = useMemo(() => {
    return Math.min(Math.max(0, initialIndex), items.length - 1)
  }, [initialIndex, items.length])

  const slides = useMemo(() => {
    return map(items, (item, index) => {
      const imageSrc = `${baseURL}/${item.path}`

      return {
        key: `${item.file_name}-${index}`,
        imageSrc,
        alt: `Generated image ${index + 1}`
      }
    })
  }, [baseURL, items])

  const onSlideChange = (swiper: Swiper) => {
    setCurrentIndex(swiper.realIndex)
  }

  return {
    slides,
    currentIndex,
    hasMultipleImages,
    safeInitialSlide,
    onSlideChange
  }
}
