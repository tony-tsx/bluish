import { getMetadataArgsStorage } from '../models/MetadataArgsStorage.js'

export function InjectableHoisting(
  target: object,
  propertyKey: string | symbol,
) {
  getMetadataArgsStorage().injectableHoistings.push({
    target,
    propertyKey,
  })
}