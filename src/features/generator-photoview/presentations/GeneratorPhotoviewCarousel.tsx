'use client'

import 'swiper/css'

import { SwiperNavigationActions } from '@/cores/presentations'
import NextImage from 'next/image'
import { FC } from 'react'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useGeneratorPhotoviewCarouselModel } from '../states/useGeneratorPhotoviewCarouselModel'

interface GeneratorPhotoviewCarouselProps {
  initialIndex: number
}

export const GeneratorPhotoviewCarousel: FC<
  GeneratorPhotoviewCarouselProps
> = ({ initialIndex }) => {
  const { slides, hasMultipleImages, safeInitialSlide, onSlideChange } =
    useGeneratorPhotoviewCarouselModel({ initialIndex })

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
      {slides.map((slide) => (
        <SwiperSlide key={slide.key} className="h-full">
          <div className="relative w-full h-[80vh] bg-black">
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
    </Swiper>
  )
}
