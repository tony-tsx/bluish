import { Context } from '../models/Context.js';
import { MetadataArgs } from './MetadataArgs.js';

export interface ParameterMetadataArgs extends MetadataArgs {
  propertyKey: string | symbol;

  parameterIndex: number;

  isStatic: boolean;

  getter(context: Context): unknown | Promise<unknown>;
}
