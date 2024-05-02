const GeneratorFunction = Object.getPrototypeOf(function* () {});

const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () {});

export type IsFalsy = false | 0 | undefined | null | '';

export function isTrusty<T>(value: T): value is Exclude<T, IsFalsy> {
  return !!value;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isInstanceOf<T>(value: unknown, constructor: new (...args: any[]) => T): value is T {
  return isObject(value) && value instanceof constructor;
}

export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

export function isConstructor<T = object>(value: unknown): value is new (...args: any[]) => T {
  return isFunction(value);
}

export function isGenerator(value: unknown): value is Generator {
  return typeof value === 'object' && value?.constructor === GeneratorFunction;
}

export function isAsyncGenerator(value: unknown): value is AsyncGenerator {
  return typeof value === 'object' && value?.constructor === AsyncGeneratorFunction;
}

export function isAnyGenerator(value: unknown): value is Generator | AsyncGenerator {
  return isGenerator(value) || isAsyncGenerator(value);
}

export function isPrototypeOf(target: Function | Object, constructor: Function): boolean {
  if (typeof target === 'function') {
    if (target === constructor) return true;

    if (target.prototype instanceof constructor) return true;

    return false;
  }

  if (target === constructor.prototype) return true;

  if (target instanceof constructor) return true;

  return false;
}

export function isMetadataArgumentFor(
  metadataArgument: { target: Function | object; propertyKey?: string | symbol },
  target: Function,
) {
  if (metadataArgument.propertyKey) return false;

  if (typeof metadataArgument.target === 'function') {
    if (metadataArgument.target === target) return true;

    if (metadataArgument.target.prototype instanceof target) return true;

    return false;
  }

  if (metadataArgument.target === target.prototype) return true;

  if (metadataArgument.target instanceof target) return true;

  return false;
}

export function isMetadataArgumentWithPropertyKeyFor(
  metadataArgumentWithPropertyKey: { target: Function | object; propertyKey?: string | symbol },
  test: { target: Function | object; propertyKey?: string | symbol },
): boolean {
  if (!metadataArgumentWithPropertyKey.propertyKey) return false;

  if (metadataArgumentWithPropertyKey.target === test.target)
    return metadataArgumentWithPropertyKey.propertyKey === test.propertyKey;

  if (typeof metadataArgumentWithPropertyKey.target === 'function') {
    if (typeof test.target !== 'function') return false;

    if (metadataArgumentWithPropertyKey.target === test.target)
      return metadataArgumentWithPropertyKey.propertyKey === test.propertyKey;

    if (metadataArgumentWithPropertyKey.target.prototype instanceof test.target)
      return metadataArgumentWithPropertyKey.propertyKey === test.propertyKey;

    return false;
  }

  if (typeof metadataArgumentWithPropertyKey.target === 'object') {
    if (typeof test.target !== 'object') return false;

    if (metadataArgumentWithPropertyKey.target === test.target)
      return metadataArgumentWithPropertyKey.propertyKey === test.propertyKey;

    if (metadataArgumentWithPropertyKey.target instanceof test.target.constructor)
      return metadataArgumentWithPropertyKey.propertyKey === test.propertyKey;

    return false;
  }

  return false;
}
