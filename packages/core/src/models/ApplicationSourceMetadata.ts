import { MetadataArg } from './MetadataArgsStorage.js'

export type ApplicationSourceMetadataEntry =
  | Record<string | symbol, any>
  | [any, any][]
  | undefined

export class ApplicationSourceMetadata extends Map<unknown, any> {
  [key: string | symbol | number]: any

  public override set(key: unknown, value: any): this {
    if (typeof key === 'string') this[key] = value
    else if (typeof key === 'symbol') this[key] = value
    else if (typeof key === 'number') this[key] = value

    return super.set(key, value)
  }

  public define(entry: ApplicationSourceMetadataEntry): void
  public define<T>(
    key: unknown,
    valueOrFactory: T | (() => T),
    reducer?: (value: T, previous: T) => T,
  ): void
  public define<T>(
    keyOrEntry: unknown | ApplicationSourceMetadataEntry,
    valueOrFactory?: T | (() => T),
    reducer?: (value: T, previous: T) => T,
  ) {
    if (typeof valueOrFactory === 'undefined') {
      const entry = keyOrEntry as ApplicationSourceMetadataEntry

      if (typeof entry === 'undefined') return

      if (Array.isArray(entry))
        return entry.forEach(([key, value]) => this.define(key, value))

      if (typeof entry !== 'object') return

      Object.getOwnPropertySymbols(entry).forEach(key =>
        this.define(key, entry[key]),
      )

      Object.getOwnPropertyNames(entry).forEach(key =>
        this.define(key, entry[key]),
      )

      return
    }

    const value =
      typeof valueOrFactory === 'function'
        ? (valueOrFactory as () => T)()
        : valueOrFactory

    if (!reducer) return this.set(keyOrEntry, value)

    if (!this.has(keyOrEntry)) return this.set(keyOrEntry, value)

    this.set(keyOrEntry, reducer(value, this.get(keyOrEntry)))
  }

  public add(_metadata: MetadataArg) {
    this.define<any>(_metadata.key, _metadata.value, _metadata.reducer)
  }
}
