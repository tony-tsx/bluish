export function refToString(ref: unknown) {
  if (typeof ref === 'string') return `string:${ref}`
  if (typeof ref === 'symbol') return `symbol:${ref.description}`
  if (typeof ref === 'function') return `function:${ref.name}`
  if (ref === null) return 'null'
  if (typeof ref === 'object') return `object:${ref.constructor.name}`
  return `unknown:${ref}`
} 