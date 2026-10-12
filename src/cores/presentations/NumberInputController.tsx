import {
  Description,
  FieldError,
  InputGroup,
  NumberField,
  NumberFieldProps
} from '@heroui/react'
import { useNumberInputController } from '@/cores/hooks/useNumberInputController'
import { ReactNode } from 'react'
import { FieldValues, Path } from 'react-hook-form'

export interface NumberInputControllerProps<T extends FieldValues> extends Omit<
  NumberFieldProps,
  'value' | 'onChange' | 'children'
> {
  controlName: Path<T>
  maximumFractionDigits?: number
  startContent?: ReactNode
  endContent?: ReactNode
  description?: ReactNode
}

export const NumberInputController = <T extends FieldValues>({
  controlName,
  minValue,
  maximumFractionDigits = 0,
  startContent,
  endContent,
  description,
  ...restProps
}: NumberInputControllerProps<T>) => {
  const { value, onChange, isInvalid, errorMessage } =
    useNumberInputController<T>(controlName)

  return (
    <NumberField
      className="min-w-0"
      {...restProps}
      fullWidth
      minValue={minValue}
      value={value}
      onChange={onChange}
      formatOptions={{
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits
      }}
      isInvalid={isInvalid}
    >
      <InputGroup fullWidth>
        {startContent && <InputGroup.Prefix>{startContent}</InputGroup.Prefix>}
        <InputGroup.Input className="min-w-0" />
        {endContent && <InputGroup.Suffix>{endContent}</InputGroup.Suffix>}
      </InputGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </NumberField>
  )
}
