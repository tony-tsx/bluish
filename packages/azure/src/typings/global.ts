import { InvocationContext } from '@azure/functions';

import { AzureFunctionAppInput } from '../AzureFunctionAppInput.js';

declare global {
  namespace Bluish {
    interface Context {
      azureFunctionAppInput: AzureFunctionAppInput;
      invocationContext: InvocationContext;
    }
  }
}

export {};
