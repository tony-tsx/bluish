import { MetadataArg } from './MetadataArgsStorage.js'

export class ApplicationSourceMetadata extends Map<unknown, any> {
  [key: string | symbol | number]: any

  public override set(key: unknown, value: any): this {
    if (typeof key === 'string') this[key] = value
    else if (typeof key === 'symbol') this[key] = value
    else if (typeof key === 'number') this[key] = value

    return super.set(key, value)
  }

  public define<T>(
    key: unknown,
    valueOrFactory: T | (() => T),
    reducer?: (value: T, previous: T) => T,
  ) {
    const value =
      typeof valueOrFactory === 'function'
        ? (valueOrFactory as () => T)()
        : valueOrFactory

    if (!reducer) return this.set(key, value)

    if (!this.has(key)) return this.set(key, value)

    return this.set(key, reducer(value, this.get(key)))
  }

  public add(_metadata: MetadataArg) {
    this.define<any>(_metadata.key, _metadata.value, _metadata.reducer)
  }
}
