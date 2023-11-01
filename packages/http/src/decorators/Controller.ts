import * as core from '@bluish/core';

import { Path } from './Path.js';

export function Controller(path: string | string[]) {
  return (target: Function) => {
    core.Controller(target);
    Path(path)(target);
  };
}
