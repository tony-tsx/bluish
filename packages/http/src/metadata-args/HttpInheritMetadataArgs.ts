import { MetadataArgs } from '@bluish/core';

export interface HttpInheritMetadataArgs extends MetadataArgs {
  propertyKey?: string | symbol;
  get: () => new () => unknown;
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      '@http:inherit': HttpInheritMetadataArgs[];
    }
  }
}
