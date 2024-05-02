export function bootstrap(identifier: unknown, initiator: () => Promise<void>): Promise<void> | void {
  if (!bootstrap.storage.has(identifier)) {
    const promise = initiator();

    bootstrap.storage.set(identifier, promise);

    promise.catch(() => bootstrap.storage.delete(identifier));

    return promise;
  }

  return bootstrap.storage.get(identifier);
}

bootstrap.storage = new Map<unknown, Promise<void> | void>();
