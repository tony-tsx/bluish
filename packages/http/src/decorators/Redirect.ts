import { Argument } from '@bluish/core';

export interface Redirect {
  (location: string, status?: number): void;
}

export function Redirect() {
  return Argument((): Redirect => () => {});
}
