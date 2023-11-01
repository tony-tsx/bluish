import { MetadataArgs } from '@bluish/core';

export interface HttpPathMetadataArgs extends MetadataArgs {
  propertyKey?: string | symbol;
  path: string;
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      '@http.paths': HttpPathMetadataArgs[];
    }
  }
}
