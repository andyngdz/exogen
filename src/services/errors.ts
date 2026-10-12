import { isAxiosError } from 'axios'
import { filter, isArray, isObject, isString, map } from 'es-toolkit/compat'

export const standardizeErrorMessage = (
  error: Error,
  defaultMessage: string
) => {
  return error.message || defaultMessage
}

const hasMessage = (entry: unknown): entry is { msg: string } =>
  isObject(entry) && 'msg' in entry && isString(entry.msg)

export class ApiErrorService {
  /**
   * The backend's reason for a failed request. FastAPI puts it in `detail`: a
   * string for handled errors, or a list of `{ msg }` for validation errors
   * (422). Axios's own message ("Request failed with status code 500") only
   * comes second, and the fallback last.
   */
  toMessage(error: unknown, fallback: string): string {
    if (isAxiosError(error)) {
      const detail: unknown = error.response?.data?.detail
      if (isString(detail)) return detail
      if (isArray(detail)) {
        return map(filter(detail, hasMessage), (entry) => entry.msg).join('; ')
      }
    }

    if (error instanceof Error && error.message) return error.message

    return fallback
  }
}

export const apiErrorService = new ApiErrorService()
