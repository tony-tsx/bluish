/* eslint-disable no-async-promise-executor */

export type NextCallback = (error?: unknown) => void;

export function useNextCallback(fn: (next: NextCallback) => void | Promise<void>) {
  return new Promise<void>(async (resolve, reject) => {
    let resolvedOrRejected = false;

    try {
      const value = await fn(error => {
        if (resolvedOrRejected) return;

        resolvedOrRejected = true;

        if (error) reject(error);
        else resolve();
      });

      if (resolvedOrRejected) return;

      resolvedOrRejected = true;

      resolve(value);
    } catch (error) {
      if (resolvedOrRejected) return;

      resolvedOrRejected = true;

      reject(error);
    }
  });
}
