export function isPropertyKey(value: unknown): value is string | symbol {
  return typeof value === 'string' || typeof value === 'symbol'
}
