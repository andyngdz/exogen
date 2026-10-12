import { first } from 'es-toolkit/compat'
import type { Key, Selection } from 'react-aria-components'

export class SelectionService {
  /** The one key of a single-select selection, or undefined when none or all. */
  toSelectedKey(selection: Selection): Key | undefined {
    if (selection === 'all') return
    return first(Array.from(selection))
  }
}

export const selectionService = new SelectionService()
