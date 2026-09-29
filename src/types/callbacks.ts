/** Callback that receives one changed value and optionally returns a result. */
export type ValueChanged<T, R = void> = (value: T) => R
