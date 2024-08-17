import { Next } from '../typings/Next.js'

export function chain<
  TArgs extends any[],
  TItem = (...args: [...TArgs, next: Next]) => unknown,
>(
  items: TItem[],
  processor: (...args: [TItem, ...TArgs, next: Next]) => unknown = (
    item,
    ...args
  ) => {
    const next = args.pop() as Next

    return (item as (...args: [...TArgs, Next]) => unknown)(
      ...(args as unknown as TArgs),
      next,
    )
  },
) {
  return (next: Next | null, ...args: TArgs) => {
    let index: number = -1

    function dispatch(i: number): Promise<unknown> {
      if (i <= index) throw new Error('next() called multiple times')

      index = i

      const item = items[i]

      if (!item)
        try {
          return Promise.resolve(next?.())
        } catch (err) {
          return Promise.reject(err)
        }

      try {
        return Promise.resolve(
          processor(
            item,
            ...(args as unknown as TArgs),
            dispatch.bind(null, i + 1),
          ),
        )
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return dispatch(0)
  }
}
