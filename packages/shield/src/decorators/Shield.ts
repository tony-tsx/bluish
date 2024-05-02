import { Context } from '@bluish/core';

import { Token } from '../interfaces/Token.js';
import { ShieldProtect } from './ShieldProtect.js';
import { ShieldScope } from './ShieldScope.js';
import { ShieldTest } from './ShieldTest.js';

export function Shield(scope: string): (target: Function | object, propertyKey: string | symbol) => void;
export function Shield(
  test: (token: Token, context: Context) => boolean,
): (target: Function | object, propertyKey: string | symbol) => void;
export function Shield(): (target: Function | object, propertyKey: string | symbol) => void;
export function Shield(maybeScopeOrTest?: string | ((token: Token, context: Context) => boolean)) {
  if (!maybeScopeOrTest) return ShieldProtect();

  if (typeof maybeScopeOrTest === 'string') return ShieldScope(maybeScopeOrTest);

  if (typeof maybeScopeOrTest === 'function') return ShieldTest(maybeScopeOrTest);

  throw new TypeError('Invalid argument');
}
