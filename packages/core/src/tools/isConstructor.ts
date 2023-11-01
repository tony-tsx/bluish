export function isConstructor<T = object>(value: unknown): value is new () => T {
  return typeof value === 'function';
}
