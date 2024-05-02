export class Headers {
  private _raw: Record<string, string> = {};

  public has(name: string): boolean {
    return !!this.get(name);
  }

  public get(): Record<string, string>;
  public get(name: string): string | null;
  public get(name?: string): Record<string, string> | string | null {
    if (!name) return this._raw;

    return this._raw[name.toLowerCase()] ?? null;
  }

  public set(name: string, value: string): void {
    this._raw[name] = value;
  }
}
