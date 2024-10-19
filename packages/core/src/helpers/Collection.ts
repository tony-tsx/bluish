export class Collection<T> extends Set<T> {
  constructor(values?: readonly T[]) {
    super(values)
  }

  public map<U>(callbackfn: (value: T) => U, thisArg?: any): U[] {
    return Array.from(this).map(callbackfn, thisArg)
  }

  public find(predicate: (value: T) => boolean, thisArg?: any): T | undefined {
    for (const value of this) if (predicate.call(thisArg, value)) return value
  }

  public some(predicate: (value: T) => boolean, thisArg?: any): boolean {
    for (const value of this) if (predicate.call(thisArg, value)) return true
    return false
  }

  public filter(predicate: (value: T) => boolean, thisArg?: any): T[] {
    return Array.from(this).filter(predicate, thisArg)
  }
}
