export type Class<T = any, A extends any[] = any> = abstract new (
  ...args: A
) => T

export type Construtable<T, A extends any[] = any> = new (...args: A) => T
