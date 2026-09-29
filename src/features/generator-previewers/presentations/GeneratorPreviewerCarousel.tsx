'use client'

import 'swiper/css'

import { SwiperNavigationActions } from '@/cores/presentations'
import { ScrollShadow } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import { ReactNode, useMemo } from 'react'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGeneratorPreviewer } from '@/features/generator-previewers/states'
import { GeneratorPreviewerItem } from './GeneratorPreviewerItem'

interface GeneratorPreviewerCarouselProps {
  leadingItem?: ReactNode
}

export const GeneratorPreviewerCarousel = ({
  leadingItem
}: GeneratorPreviewerCarouselProps) => {
  const { imageStepEnds } = useGeneratorPreviewer()

  const ImageSlides = useMemo(() => {
    return map(imageStepEnds, (imageStepEnd) => (
      <SwiperSlide key={imageStepEnd.index} className="h-full">
        <GeneratorPreviewerItem imageStepEnd={imageStepEnd} />
      </SwiperSlide>
    ))
  }, [imageStepEnds])

  const hasAnySlides = !isEmpty(imageStepEnds) || !!leadingItem

  if (!hasAnySlides) {
    return (
      <div className="flex justify-center items-center text-foreground">
        No images to display
      </div>
    )
  }

  const shouldLoop = imageStepEnds.length + (leadingItem ? 1 : 0) > 1

  return (
    <ScrollShadow className="relative h-full">
      <Swiper
        modules={[Mousewheel, Keyboard]}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 16
          },
          640: {
            slidesPerView: 1.5,
            spaceBetween: 16
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 16
          }
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true
        }}
        className="h-full"
        loop={shouldLoop}
      >
        {leadingItem && (
          <SwiperSlide key="leading-item" className="h-full">
            {leadingItem}
          </SwiperSlide>
        )}
        {ImageSlides}
        <SwiperNavigationActions
          previousLabel="Previous image"
          nextLabel="Next image"
        />
      </Swiper>
    </ScrollShadow>
  )
}
