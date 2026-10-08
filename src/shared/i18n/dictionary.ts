import type { hr } from './hr'

// The Croatian dictionary's shape with its literal strings widened to string.
type Widen<T> = T extends string
    ? string
    : T extends (...args: infer TArgs) => infer TResult
      ? (...args: TArgs) => Widen<TResult>
      : { readonly [TKey in keyof T]: Widen<T[TKey]> }

export type Dictionary = Widen<typeof hr>
