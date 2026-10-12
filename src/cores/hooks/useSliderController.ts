import { sliderChangeService } from '@/services'
import { SliderChangeValue, ValueChanged } from '@/types'
import {
  FieldValues,
  Path,
  useController,
  useFormContext
} from 'react-hook-form'

/** Binds a single-thumb slider to a numeric form field. */
export const useSliderController = <T extends FieldValues>(
  controlName: Path<T>
) => {
  const { control } = useFormContext<T>()
  const { field } = useController({ control, name: controlName })

  const onChange: ValueChanged<SliderChangeValue> = (value) => {
    field.onChange(sliderChangeService.toSingle(value))
  }

  return { value: field.value, onChange }
}
