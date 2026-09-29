import { SkeletonLoader } from '@/cores/presentations'
import { useHistories } from '@/features/histories/states'
import { Accordion, ScrollShadow } from '@heroui/react'
import { isEmpty, map } from 'es-toolkit/compat'
import { Fragment } from 'react/jsx-runtime'
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
        {(loadedHistoryGroups) => (
          <ScrollShadow className="h-full">
            <Accordion>
              {map(loadedHistoryGroups, (group) => (
                <Accordion.Item
                  key={group.date}
                  id={group.date}
                  aria-label={`History group for ${group.date}`}
                >
                  <Accordion.Heading>
                    <Accordion.Trigger className="text-sm font-semibold">
                      {group.date}
                      <Accordion.Indicator />
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <HistoryGroup histories={group.histories} />
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </ScrollShadow>
        )}
      </SkeletonLoader>
      <HistoryPhotoviewModal />
    </Fragment>
  )
}
