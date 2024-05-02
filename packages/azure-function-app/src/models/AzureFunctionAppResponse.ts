export class AzureFunctionAppResponse {
  private _headers: Record<string, string> = {};
  private _body: unknown;
  private _status: number = 200;

  public header(name: string, value: string): this {
    this._headers[name] = value;

    return this;
  }

  public json(body: unknown): this {
    this._body = JSON.stringify(body);

    this.header('Content-Type', 'application/json');

    return this;
  }

  public send(body: unknown): this {
    this._body = body;

    return this;
  }

  public status(): number;
  public status(status: number): this;
  public status(status?: number): this | number {
    if (status === undefined) return this._status;

    this._status = status;

    return this;
  }

  public toAzureHttpResponse() {
    return {
      body: this._body as any,
      headers: this._headers,
      status: this._status ? this._status : this._body !== undefined ? 200 : 204,
    };
  }
}
