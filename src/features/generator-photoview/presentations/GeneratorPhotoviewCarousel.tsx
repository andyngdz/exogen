'use client'

import 'swiper/css'

import { SwiperNavigationActions } from '@/cores/presentations'
import { map } from 'es-toolkit/compat'
import NextImage from 'next/image'
import { FC } from 'react'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGeneratorPhotoviewCarouselModel } from '@/features/generator-photoview/states/useGeneratorPhotoviewCarouselModel'
import { GeneratorPhotoviewThumbnails } from './GeneratorPhotoviewThumbnails'

interface GeneratorPhotoviewCarouselProps {
  initialIndex: number
}

export const GeneratorPhotoviewCarousel: FC<
  GeneratorPhotoviewCarouselProps
> = ({ initialIndex }) => {
  const {
    slides,
    currentIndex,
    hasMultipleImages,
    safeInitialSlide,
    onSlideChange
  } = useGeneratorPhotoviewCarouselModel({ initialIndex })

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
      onSlideChange={onSlideChange}
      className="w-full"
      loop={hasMultipleImages}
    >
      {map(slides, (slide) => (
        <SwiperSlide key={slide.key} className="h-full">
          <div className="relative w-full h-[70vh]">
            <NextImage
              src={slide.imageSrc}
              alt={slide.alt}
              className="object-contain"
              fill
            />
          </div>
        </SwiperSlide>
      ))}
      {hasMultipleImages && (
        <SwiperNavigationActions
          previousLabel="Previous image"
          nextLabel="Next image"
        />
      )}
      {hasMultipleImages && (
        <div slot="container-end">
          <GeneratorPhotoviewThumbnails
            slides={slides}
            currentIndex={currentIndex}
          />
        </div>
      )}
    </Swiper>
  )
}
