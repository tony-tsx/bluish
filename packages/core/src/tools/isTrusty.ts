export type IsFalsy = false | 0 | undefined | null | '';

export function isTrusty<T>(value: T): value is Exclude<T, IsFalsy> {
  return !!value;
}
