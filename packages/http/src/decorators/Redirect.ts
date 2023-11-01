import { Parameter } from '@bluish/core';

export interface Redirect {
  (location: string, status?: number): void;
}

export function Redirect() {
  return Parameter((): Redirect => () => {});
}
