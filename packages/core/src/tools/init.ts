export function init(identifier: unknown, initiator: () => Promise<void>): Promise<void> | void {
  if (!init.storage.has(identifier)) {
    const promise = initiator();

    init.storage.set(identifier, promise);

    promise.catch(() => init.storage.delete(identifier));

    return promise;
  }

  return init.storage.get(identifier);
}

init.storage = new Map<unknown, Promise<void> | void>();
