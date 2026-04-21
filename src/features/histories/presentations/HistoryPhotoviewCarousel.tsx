'use client'

import 'swiper/css'

import { useHistoriesQuery } from '@/cores/api-queries'
import { SwiperNavigationActions } from '@/cores/presentations'
import { isEmpty } from 'es-toolkit/compat'
import { FC, useMemo } from 'react'
import { Keyboard, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { HistoryPhotoviewCard } from './HistoryPhotoviewCard'

interface HistoryPhotoviewCarouselProps {
  currentHistoryId: number
}

export const HistoryPhotoviewCarousel: FC<HistoryPhotoviewCarouselProps> = ({
  currentHistoryId
}) => {
  const { data: histories = [] } = useHistoriesQuery()
  const hasMultipleHistories = histories.length > 1

  const initialSlide = useMemo(() => {
    const index = histories.findIndex((h) => h.id === currentHistoryId)

    return Math.max(0, index)
  }, [currentHistoryId, histories])

  const slides = useMemo(() => {
    return histories.map((history) => (
      <SwiperSlide key={history.id}>
        <HistoryPhotoviewCard history={history} />
      </SwiperSlide>
    ))
  }, [histories])

  if (isEmpty(histories)) {
    return (
      <div className="flex justify-center items-center h-full text-default-500">
        No history items to display
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
      initialSlide={initialSlide}
      className="w-full"
      loop={hasMultipleHistories}
    >
      {slides}
      {hasMultipleHistories && (
        <SwiperNavigationActions
          previousLabel="Previous history"
          nextLabel="Next history"
        />
      )}
    </Swiper>
  )
}
