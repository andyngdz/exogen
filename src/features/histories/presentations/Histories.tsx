import { SkeletonLoader } from '@/cores/presentations'
import { Accordion, AccordionItem, ScrollShadow } from '@heroui/react'
import { isEmpty } from 'es-toolkit/compat'
import { Fragment } from 'react/jsx-runtime'
import { useHistories } from '../states'
import { HistoryEmpty } from './HistoryEmpty'
import { HistoryErrors } from './HistoryErrors'
import { HistoryGroup } from './HistoryGroup'
import { HistoryLoader } from './HistoryLoader'
import { HistoryPhotoviewModal } from './HistoryPhotoviewModal'

export const Histories = () => {
  const { historyGroups, isLoading, error } = useHistories()

  if (error) {
    return <HistoryErrors error={error} />
  }

  if (isEmpty(historyGroups) && !isLoading) {
    return <HistoryEmpty />
  }

  return (
    <Fragment>
      <SkeletonLoader
        isLoading={isLoading}
        data={historyGroups}
        skeleton={<HistoryLoader />}
      >
        {(historyGroups) => (
          <ScrollShadow className="h-full">
            <Accordion>
              {historyGroups.map((group) => (
                <AccordionItem
                  key={group.date}
                  title={group.date}
                  aria-label={`History group for ${group.date}`}
                  classNames={{
                    title: 'text-sm font-semibold'
                  }}
                >
                  <HistoryGroup key={group.date} histories={group.histories} />
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollShadow>
        )}
      </SkeletonLoader>
      <HistoryPhotoviewModal />
    </Fragment>
  )
}
