'use client'

import { Allotment } from 'allotment'
import 'allotment/dist/style.css'
import { FormProvider, useForm } from 'react-hook-form'
import { ModelSearchFormValues } from '../types'
import { ModelSearchInput } from './ModelSearchInput'
import { ModelSearchListModel } from './ModelSearchListModel'
import { ModelSearchView } from './ModelSearchView'

export const ModelSearchContainer = () => {
  const methods = useForm<ModelSearchFormValues>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues: { query: '' }
  })

  return (
    <FormProvider {...methods}>
      <Allotment defaultSizes={[300, 0]}>
        <Allotment.Pane maxSize={350} minSize={300} preferredSize={300}>
          <div className="flex flex-col gap-4 p-2 h-full">
            <ModelSearchInput />
            <ModelSearchListModel />
          </div>
        </Allotment.Pane>
        <Allotment.Pane className="flex flex-col">
          <ModelSearchView />
        </Allotment.Pane>
      </Allotment>
    </FormProvider>
  )
}
