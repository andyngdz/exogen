import { NumberInput, NumberInputProps } from '@heroui/react'
import { Control, FieldValues, Path, useController } from 'react-hook-form'

export interface NumberInputControllerProps<
  T extends FieldValues,
  C
> extends NumberInputProps {
  control: Control<T, C, T>
  controlName: Path<T>
  maximumFractionDigits?: number
}

export const NumberInputController = <T extends FieldValues, C>({
  control,
  controlName,
  minValue,
  maximumFractionDigits = 0,
  ...restProps
}: NumberInputControllerProps<T, C>) => {
  const { field, fieldState } = useController({
    control,
    name: controlName,
    rules: {
      validate: (value) => {
        if (Number.isNaN(value)) {
          return 'Input is required'
        }
      }
    }
  })

  return (
    <NumberInput
      {...restProps}
      hideStepper
      minValue={minValue}
      value={field.value}
      onValueChange={field.onChange}
      formatOptions={{
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits
      }}
      errorMessage={fieldState.error?.message}
      isInvalid={fieldState.invalid}
      classNames={{
        inputWrapper: 'max-h-8'
      }}
    />
  )
}
