const GeneratorFunction = Object.getPrototypeOf(function* () {});

const AsyncGeneratorFunction = Object.getPrototypeOf(async function* () {});

export function isGenerator(value: unknown): value is Generator {
  return typeof value === 'object' && value?.constructor === GeneratorFunction;
}

export function isAsyncGenerator(value: unknown): value is AsyncGenerator {
  return typeof value === 'object' && value?.constructor === AsyncGeneratorFunction;
}

export function isAnyGenerator(value: unknown): value is Generator | AsyncGenerator {
  return isGenerator(value) || isAsyncGenerator(value);
}
