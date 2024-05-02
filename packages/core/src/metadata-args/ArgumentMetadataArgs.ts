import { Context } from '../models/Context.js';

export interface ArgumentMetadataArgs {
  target: Function | object;
  propertyKey: string | symbol;
  parameterIndex: number;
  getter(context: Context): unknown | Promise<unknown>;
}
