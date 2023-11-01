import { MetadataArgs } from '@bluish/core';

import { Request } from '../models/Request.js';

export interface HttpParamMetadataArgs extends MetadataArgs {
  paramName: string;
  loader: (value: string, context: Request) => unknown;
}

declare global {
  namespace Bluish {
    interface MetadataArgsStorage {
      '@http.params': HttpParamMetadataArgs[];
    }
  }
}
