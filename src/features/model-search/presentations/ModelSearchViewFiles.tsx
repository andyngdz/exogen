import { formatter } from '@/services'
import { ModelDetailsSibling } from '@/types'
import { Table } from '@heroui/react'
import { map } from 'es-toolkit/compat'
import { Container } from 'lucide-react'
import { FC } from 'react'
import { ModelSearchViewHeader } from './ModelSearchViewHeader'

export interface ModelSearchViewFilesProps {
  id: string
  siblings: ModelDetailsSibling[]
}

export const ModelSearchViewFiles: FC<ModelSearchViewFilesProps> = ({
  id,
  siblings
}) => {
  return (
    <div className="flex flex-col gap-6">
      <ModelSearchViewHeader
        Icon={Container}
        title="Files"
        href={`https://huggingface.co/${id}/tree/main`}
      />
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Files table">
            <Table.Header>
              <Table.Column isRowHeader>Name</Table.Column>
              <Table.Column>Size</Table.Column>
            </Table.Header>
            <Table.Body>
              {map(siblings, (sibling) => {
                return (
                  <Table.Row key={sibling.rfilename} id={sibling.rfilename}>
                    <Table.Cell>{sibling.rfilename}</Table.Cell>
                    <Table.Cell>{formatter.bytes(sibling.size)}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </div>
  )
}
