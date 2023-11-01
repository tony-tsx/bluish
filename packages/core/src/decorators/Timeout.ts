/* eslint-disable no-async-promise-executor */
/* eslint-disable no-constant-condition */
/* eslint-disable promise/valid-params */
import { isAnyGenerator as isAnyGenerator } from '../tools/isGenerator.js';
import { Parameter } from './Parameter.js';
import { Wrapper } from './Wrapper.js';

export class TimeoutError extends Error {}

export function Timeout(duration: number) {
  return Wrapper((fn, context) => {
    const abortController = new AbortController();

    context[Symbol.for('timeout.signal')] = abortController.signal;

    return new Promise(async (resolve, reject) => {
      const _return = fn();

      if (isAnyGenerator(_return)) {
        let isTimeout = false;

        const timeout = setTimeout(async () => {
          isTimeout = true;

          const error = new TimeoutError();

          Error.captureStackTrace(error, fn);

          const { done } = await _return.throw(error);

          reject(error);

          if (!done) run(_return);
        }, duration);

        await run(_return, {
          continue: () => !isTimeout,
          then: value => !isTimeout && resolve(value),
          finally: () => clearTimeout(timeout),
        });
      } else {
        await Promise.race([
          _return,
          new Promise((_resolve, reject) => setTimeout(() => reject(new TimeoutError()), duration)),
        ]).then(resolve, reject);
      }
    });
  });
}

interface RunConfiguration {
  continue?(): boolean;
  then?(value: unknown): void;
  finally?(): void;
}

async function run(generator: Generator | AsyncGenerator, config?: RunConfiguration): Promise<void> {
  let nextValue: unknown;

  let nextError: unknown;

  do {
    const cont = config?.continue?.();
    if (cont === false) break;

    try {
      const context = nextError !== undefined ? await generator.throw(nextError) : await generator.next(nextValue);

      nextError = undefined;

      nextValue = await context.value;

      if (context.done) {
        config?.then?.(nextValue);
        break;
      }
    } catch (_error) {
      nextError = _error;

      nextValue = undefined;
    }
  } while (true);

  config?.finally?.();
}

export namespace Timeout {
  export function Signal() {
    return Parameter(context => context[Symbol.for('timeout.signal')]);
  }
}
