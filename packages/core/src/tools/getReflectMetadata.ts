export function getReflectMetadata<T = unknown>(
  metadataKey: any,
  target: object,
): undefined | T
export function getReflectMetadata<T = unknown>(
  metadataKey: any,
  target: object,
  propertyKey: undefined | string | symbol,
): undefined | T
export function getReflectMetadata(
  metadataKey: any,
  target: object,
  propertyKey?: string | symbol,
) {
  if (!('getMetadata' in Reflect)) return undefined

  // @ts-expect-error: TODO
  return Reflect.getMetadata(metadataKey, target, propertyKey)
}
