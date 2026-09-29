import {
  FieldValues,
  Path,
  useController,
  useFormContext
} from 'react-hook-form'

export const useNumberInputController = <T extends FieldValues>(
  controlName: Path<T>
) => {
  const { control } = useFormContext<T>()
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

  return {
    value: field.value,
    onChange: field.onChange,
    isInvalid: fieldState.invalid,
    errorMessage: fieldState.error?.message
  }
}
