'use client'

import 'swiper/css'

import { useBackendUrl } from '@/cores/backend-initialization'
import { SwiperNavigationActions } from '@/cores/presentations'
import { useUseImageGenerationStore } from '@/features/generators'
import { Skeleton } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import NextImage from 'next/image'
import { FC, useMemo } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGeneratorPhotoviewStore } from '../states/useGeneratorPhotoviewStore'

interface GeneratorPhotoviewCarouselProps {
  initialIndex: number
}

export const GeneratorPhotoviewCarousel: FC<
  GeneratorPhotoviewCarouselProps
> = ({ initialIndex }) => {
  const baseURL = useBackendUrl()
  const { items, imageStepEnds } = useUseImageGenerationStore()
  const { setCurrentIndex } = useGeneratorPhotoviewStore()
  const hasMultipleImages = items.length > 1

  const safeInitialSlide = useMemo(() => {
    if (items.length === 0) return 0
    return Math.min(Math.max(0, initialIndex), items.length - 1)
  }, [initialIndex, items.length])

  const slides = useMemo(() => {
    return items.map((item, index) => {
      const imageBase64 = imageStepEnds[index]?.image_base64 ?? ''
      const hasFileImage = !isEmpty(item.path)
      const hasBase64Image = !isEmpty(imageBase64)

      let imageSrc = ''
      if (hasFileImage) {
        imageSrc = `${baseURL}/${item.path}`
      } else if (hasBase64Image) {
        imageSrc = `data:image/png;base64,${imageBase64}`
      }

      return (
        <SwiperSlide key={`${item.file_name}-${index}`} className="h-full">
          <div className="relative w-full h-[80vh] bg-black">
            {isEmpty(imageSrc) ? (
              <div className="absolute inset-0 grid place-items-center">
                <Skeleton className="w-2/3 h-2/3 rounded-xl" />
              </div>
            ) : (
              <NextImage
                src={imageSrc}
                alt={`Generated image ${index + 1}`}
                className="object-contain"
                fill
              />
            )}
          </div>
        </SwiperSlide>
      )
    })
  }, [baseURL, imageStepEnds, items])

  if (isEmpty(items)) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-default-500">
        No images to display
      </div>
    )
  }

  return (
    <Swiper
      modules={[Mousewheel, Keyboard]}
      slidesPerView={1}
      spaceBetween={24}
      keyboard={{
        enabled: true,
        onlyInViewport: true
      }}
      initialSlide={safeInitialSlide}
      onSlideChange={(swiper: SwiperType) => {
        setCurrentIndex(swiper.realIndex)
      }}
      className="w-full"
      loop={hasMultipleImages}
    >
      {slides}
      {hasMultipleImages && (
        <SwiperNavigationActions
          previousLabel="Previous image"
          nextLabel="Next image"
        />
      )}
    </Swiper>
  )
}
