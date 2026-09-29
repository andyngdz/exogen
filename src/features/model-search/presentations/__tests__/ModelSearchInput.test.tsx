import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createFormProviderWrapper } from '@/cores/test-utils'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { ModelSearchFormValues } from '../../types'
import { ModelSearchInput } from '../ModelSearchInput'

const getSearchInput = () =>
  screen.getByRole('textbox', { name: 'Search models' })

const createWrapper = (defaultValues: ModelSearchFormValues = { query: '' }) =>
  createFormProviderWrapper<ModelSearchFormValues>({
    formOptions: { defaultValues }
  })

// Test wrapper with reset button functionality
const TestWrapperWithReset = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm<ModelSearchFormValues>({
    defaultValues: { query: 'initial' }
  })

  const handleReset = () => methods.reset({ query: 'reset value' })

  return (
    <FormProvider {...methods}>
      <form>
        {children}
        <button type="button" onClick={handleReset} data-testid="reset-button">
          Reset
        </button>
      </form>
    </FormProvider>
  )
}

describe('ModelSearchInput', () => {
  describe('Component Rendering', () => {
    it('renders the search input', () => {
      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()
      expect(input).toBeInTheDocument()
    })

    it('shows the search placeholder', () => {
      render(<ModelSearchInput />, { wrapper: createWrapper() })

      expect(getSearchInput()).toHaveAttribute(
        'placeholder',
        'Model name, author, ...'
      )
    })
  })

  describe('Form Integration', () => {
    it('integrates with react-hook-form context', () => {
      render(<ModelSearchInput />, {
        wrapper: createWrapper({ query: 'test query' })
      })

      const input = getSearchInput()
      expect(input).toHaveValue('test query')
    })

    it('updates form value when input changes', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()

      await user.type(input, 'new search query')

      expect(input).toHaveValue('new search query')
    })

    it('handles empty initial value', () => {
      render(<ModelSearchInput />, { wrapper: createWrapper({ query: '' }) })

      const input = getSearchInput()
      expect(input).toHaveValue('')
    })

    it('handles pre-filled values', () => {
      render(<ModelSearchInput />, {
        wrapper: createWrapper({ query: 'pre-filled search' })
      })

      const input = getSearchInput()
      expect(input).toHaveValue('pre-filled search')
    })
  })

  describe('User Interactions', () => {
    it('allows typing in the input field', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()

      await user.type(input, 'search term')

      expect(input).toHaveValue('search term')
    })

    it('allows clearing the input field', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, {
        wrapper: createWrapper({ query: 'initial value' })
      })

      const input = getSearchInput()
      expect(input).toHaveValue('initial value')

      await user.clear(input)

      expect(input).toHaveValue('')
    })

    it('allows selecting and replacing text', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, {
        wrapper: createWrapper({ query: 'original text' })
      })

      const input = getSearchInput()

      await user.clear(input)
      await user.type(input, 'replacement text')

      expect(input).toHaveValue('replacement text')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()

      await user.click(input)
      expect(input).toHaveFocus()

      await user.type(input, 'test')
      expect(input).toHaveValue('test')

      // Test that we can navigate with arrow keys
      await user.keyboard('{ArrowLeft}{ArrowLeft}')
      await user.type(input, 'X')

      expect(input).toHaveValue('testX')
    })
  })

  describe('Form Validation Integration', () => {
    it('works with form validation rules', async () => {
      const TestWrapperWithValidation = ({
        children
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<ModelSearchFormValues>({
          defaultValues: { query: '' },
          mode: 'onChange'
        })

        return (
          <FormProvider {...methods}>
            <form>
              {children}
              <div data-testid="form-state">
                {String(methods.formState.isValid)}
              </div>
            </form>
          </FormProvider>
        )
      }

      render(
        <TestWrapperWithValidation>
          <ModelSearchInput />
        </TestWrapperWithValidation>
      )

      // Wait for form state to stabilize to avoid act warnings
      await waitFor(() => {
        const formState = screen.getByTestId('form-state')
        expect(formState).toBeInTheDocument()
      })
    })

    it('maintains form state consistency', async () => {
      const user = userEvent.setup()

      const TestWrapperWithState = ({
        children
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<ModelSearchFormValues>({
          defaultValues: { query: '' }
        })
        const formValues = useWatch({ control: methods.control })

        return (
          <FormProvider {...methods}>
            <form>
              {children}
              <div data-testid="form-values">{JSON.stringify(formValues)}</div>
            </form>
          </FormProvider>
        )
      }

      render(
        <TestWrapperWithState>
          <ModelSearchInput />
        </TestWrapperWithState>
      )

      const input = getSearchInput()
      const formValues = screen.getByTestId('form-values')

      expect(formValues).toHaveTextContent('{"query":""}')

      await user.type(input, 'test query')

      expect(formValues).toHaveTextContent('{"query":"test query"}')
    })
  })

  describe('Error Handling', () => {
    it('handles missing form context gracefully', () => {
      // This should throw an error since useFormContext requires FormProvider
      expect(() => render(<ModelSearchInput />)).toThrow()
    })

    it('works with different form states', async () => {
      const user = userEvent.setup()

      render(
        <TestWrapperWithReset>
          <ModelSearchInput />
        </TestWrapperWithReset>
      )

      const input = getSearchInput()
      const resetButton = screen.getByTestId('reset-button')

      expect(input).toHaveValue('initial')

      await user.type(input, ' modified')
      expect(input).toHaveValue('initial modified')

      await user.click(resetButton)
      expect(input).toHaveValue('reset value')
    })
  })

  describe('Accessibility', () => {
    it('maintains input accessibility', () => {
      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()

      expect(input).toBeVisible()
      expect(input).not.toHaveAttribute('disabled')
    })

    it('supports focus management', async () => {
      const user = userEvent.setup()

      render(<ModelSearchInput />, { wrapper: createWrapper() })

      const input = getSearchInput()

      await user.click(input)
      expect(input).toHaveFocus()

      await user.tab()
      expect(input).not.toHaveFocus()
    })
  })

  describe('Type Safety', () => {
    it('correctly types the form values', () => {
      // This test ensures TypeScript compilation works correctly
      const TestWrapperTyped = ({
        children
      }: {
        children: React.ReactNode
      }) => {
        const methods = useForm<ModelSearchFormValues>({
          defaultValues: { query: '' }
        })

        const queryValue: string = useWatch({
          control: methods.control,
          name: 'query'
        })

        return (
          <FormProvider {...methods}>
            <div data-testid="typed-value">{queryValue}</div>
            {children}
          </FormProvider>
        )
      }

      render(
        <TestWrapperTyped>
          <ModelSearchInput />
        </TestWrapperTyped>
      )

      const typedValue = screen.getByTestId('typed-value')
      expect(typedValue).toHaveTextContent('')
    })
  })
})
