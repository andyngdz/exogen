import { Button } from '@heroui/react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { FC } from 'react'
import { useSwiper } from 'swiper/react'

interface SwiperNavigationActionsProps {
  previousLabel?: string
  nextLabel?: string
}

export const SwiperNavigationActions: FC<SwiperNavigationActionsProps> = ({
  previousLabel = 'Previous',
  nextLabel = 'Next'
}) => {
  const swiper = useSwiper()

  const onPrevious = () => {
    swiper.slidePrev()
  }

  const onNext = () => {
    swiper.slideNext()
  }

  return (
    <div className="absolute inset-4 flex items-center justify-between pointer-events-none">
      <Button
        isIconOnly
        variant="flat"
        color="default"
        onPress={onPrevious}
        className="z-10 pointer-events-auto"
        aria-label={previousLabel}
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        isIconOnly
        variant="flat"
        color="default"
        onPress={onNext}
        className="z-10 pointer-events-auto"
        aria-label={nextLabel}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
