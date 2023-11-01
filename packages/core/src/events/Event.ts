export abstract class Event {
  private _defaultPrevented: boolean = false;

  private _stopedPropagation: boolean = false;

  public readonly createdAt: Date;

  public readonly cancelable: boolean;

  public readonly stopable: boolean;

  constructor() {
    this._defaultPrevented = false;
    this._stopedPropagation = false;
    this.createdAt = new Date();
    this.cancelable = false;
    this.stopable = false;
  }

  get defaultPrevented() {
    return this._defaultPrevented;
  }

  get stopedPropagation() {
    return this._stopedPropagation;
  }

  public preventDefault() {
    if (!this.cancelable) return;

    this._defaultPrevented = true;
  }

  public stopPropagation() {
    if (!this.stopable) return;

    this._stopedPropagation = true;
  }
}
