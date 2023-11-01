import debug from 'debug';

export class Debugger {
  private static _storage = new Map<string, Debugger>();

  public static use(tag: string): Debugger {
    if (!this._storage.has(tag)) this._storage.set(tag, new Debugger(`bluish:${tag}`));

    return this._storage.get(tag)!;
  }

  private _debugger: debug.Debugger;

  public readonly track = {
    time: (fn: (time: number) => string) => {
      const startAt = new Date();

      return {
        [Symbol.dispose]: () => {
          this.log(fn(new Date().getTime() - startAt.getTime()));
        },
      };
    },
  };

  protected constructor(tag: string) {
    this._debugger = debug(tag);
  }

  public log(...messages: [any, ...any[]]) {
    this._debugger(...messages);
  }

  public at(...messages: [any, ...any[]]) {
    this.log(...messages, 'at', new Date());
  }
}
