import { useSliderController } from '@/cores/hooks/useSliderController'
import { Label, Slider, SliderProps } from '@heroui/react'
import { FieldValues, Path } from 'react-hook-form'

export interface SliderControllerProps<T extends FieldValues> extends Omit<
  SliderProps,
  'value' | 'onChange' | 'children'
> {
  controlName: Path<T>
  label: string
}

/** A labeled single-thumb slider that shows its value and writes a form field. */
export const SliderController = <T extends FieldValues>({
  controlName,
  label,
  ...restProps
}: SliderControllerProps<T>) => {
  const { value, onChange } = useSliderController<T>(controlName)

  return (
    <Slider {...restProps} value={value} onChange={onChange}>
      <Label>{label}</Label>
      <Slider.Output />
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
  )
}
