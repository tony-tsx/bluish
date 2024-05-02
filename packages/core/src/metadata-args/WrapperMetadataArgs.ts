import { Context } from '../index.js';

export interface WrapperMetadataArgs {
  target: Function | object;
  propertyKey?: string | symbol;
  wrapper: (fn: () => unknown, context: Context) => unknown;
}
