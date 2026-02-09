import { useBackendUrl } from '@/cores/backend-initialization'
import { useUseImageGenerationStore } from '@/features/generators'
import { useMemo } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { useGeneratorPhotoviewStore } from './useGeneratorPhotoviewStore'

interface GeneratorPhotoviewSlideModel {
  key: string
  imageSrc: string
  alt: string
}

interface UseGeneratorPhotoviewCarouselModelParams {
  initialIndex: number
}

export const useGeneratorPhotoviewCarouselModel = ({
  initialIndex
}: UseGeneratorPhotoviewCarouselModelParams) => {
  const baseURL = useBackendUrl()
  const { items } = useUseImageGenerationStore()
  const { setCurrentIndex } = useGeneratorPhotoviewStore()

  const hasMultipleImages = items.length > 1

  const safeInitialSlide = useMemo(() => {
    return Math.min(Math.max(0, initialIndex), items.length - 1)
  }, [initialIndex, items.length])

  const slides = useMemo<GeneratorPhotoviewSlideModel[]>(() => {
    return items.map((item, index) => {
      const imageSrc = `${baseURL}/${item.path}`

      return {
        key: `${item.file_name}-${index}`,
        imageSrc,
        alt: `Generated image ${index + 1}`
      }
    })
  }, [baseURL, items])

  const onSlideChange = (swiper: SwiperType) => {
    setCurrentIndex(swiper.realIndex)
  }

  return {
    slides,
    hasMultipleImages,
    safeInitialSlide,
    onSlideChange
  }
}
