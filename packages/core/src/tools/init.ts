const storage = new Map<unknown, Promise<void> | void>();

export function init(identifier: unknown, initiator: () => Promise<void>): Promise<void> | void {
  if (!storage.has(identifier)) {
    const promise = initiator();

    storage.set(identifier, promise);

    promise.catch(() => storage.delete(identifier));

    return promise;
  }

  return storage.get(identifier);
}
