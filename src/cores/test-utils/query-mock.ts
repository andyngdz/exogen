import { UseQueryResult } from '@tanstack/react-query'

/**
 * Creates a mock query result with the provided data.
 *
 * @template T The type of data returned by the query
 * @param {T | null} data The data to be returned by the mock query
 * @param {Partial<UseQueryResult<T>>} overrides Optional overrides for the query result
 * @returns {UseQueryResult<T>} A mock query result
 */
export const createMockQuery = <T>(
  data: T | null,
  overrides?: Partial<UseQueryResult<T>>
): UseQueryResult<T> => {
  return {
    data,
    isLoading: false,
    isError: false,
    error: null,
    isSuccess: !!data,
    ...overrides
  } as UseQueryResult<T>
}
