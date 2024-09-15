export function getReflectMetadata<T = unknown>(
  metadataKey: any,
  target: Object,
): undefined | T
export function getReflectMetadata<T = unknown>(
  metadataKey: any,
  target: Object,
  propertyKey: undefined | string | symbol,
): undefined | T
export function getReflectMetadata(
  metadataKey: any,
  target: Object,
  propertyKey?: string | symbol,
) {
  if (!('getMetadata' in Reflect)) return undefined

  // @ts-expect-error: TODO
  return Reflect.getMetadata(metadataKey, target, propertyKey)
}
