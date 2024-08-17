import { MetadataArg } from './MetadataArgsStorage.js'

export class ApplicationSourceMetadata extends Map<string | symbol, any> {
  public add(_metadata: MetadataArg) {
    const value =
      typeof _metadata.value === 'function'
        ? _metadata.value()
        : _metadata.value

    if (!_metadata.reducer) return this.set(_metadata.key, value)

    if (!this.has(_metadata.key)) return this.set(_metadata.key, value)

    return this.set(
      _metadata.key,
      _metadata.reducer(value, this.get(_metadata.key)),
    )
  }
}
