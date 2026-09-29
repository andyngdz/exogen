/**
 * Builds a stand-in for a Zustand store hook that answers each selector call
 * from a fixed state object, so tests can mock stores read through selectors.
 */
export const createStoreSelectorMock =
  <S>(state: S) =>
  // Tests pass only the slice the code reads, so the selector takes never to
  // stay assignable to any store hook's selector parameter.
  (selector: (storeState: never) => unknown) =>
    selector(state as never)
