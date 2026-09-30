import { Button } from '@heroui/react'
import clsx from 'clsx'
import { map } from 'es-toolkit/compat'
import NextImage from 'next/image'
import { FC } from 'react'
import { useSwiper } from 'swiper/react'

interface PhotoviewThumbnail {
  key: string
  imageSrc: string
  alt: string
}

interface GeneratorPhotoviewThumbnailsProps {
  slides: PhotoviewThumbnail[]
  currentIndex: number
}

/** Jumps the enclosing Swiper to an image; must render inside that Swiper. */
export const GeneratorPhotoviewThumbnails: FC<
  GeneratorPhotoviewThumbnailsProps
> = ({ slides, currentIndex }) => {
  const swiper = useSwiper()

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {map(slides, (slide, index) => (
        <Button
          key={slide.key}
          isIconOnly
          variant="ghost"
          aria-label={`Show image ${index + 1}`}
          aria-current={index === currentIndex}
          onPress={() => swiper.slideToLoop(index)}
          className={clsx(
            'relative size-12 overflow-hidden p-0',
            index === currentIndex && 'ring-2 ring-accent'
          )}
        >
          <NextImage
            src={slide.imageSrc}
            alt=""
            fill
            className="object-cover"
          />
        </Button>
      ))}
    </div>
  )
}
