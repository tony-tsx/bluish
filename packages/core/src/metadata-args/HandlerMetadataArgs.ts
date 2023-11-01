import { MetadataArgs } from './MetadataArgs.js';

export type HandlerMetadataArgType = keyof Bluish.HandlerMetadataArgMapByType;

export interface BaseHandlerMetadataArgs extends MetadataArgs {
  propertyKey: string | symbol;

  isStatic: boolean;

  name?: string;
}

export type HandlerMetadataArgs<TType extends HandlerMetadataArgType = HandlerMetadataArgType> = {
  type: TType;
} & Bluish.HandlerMetadataArgs &
  BaseHandlerMetadataArgs &
  Bluish.HandlerMetadataArgMapByType[TType];

declare global {
  namespace Bluish {
    interface HandlerMetadataArgs {}

    interface HandlerMetadataArgMapByType extends Record<string, Record<string, unknown>> {}
  }
}
