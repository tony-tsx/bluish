import { FunctionOutput } from '@azure/functions';
import { Context, MetadataArgs, Parameter, getMetadataArgsStorage } from '@bluish/core';

export interface AzureFunctionAppOutputConfiguration {
  onContext(context: Context): void | Promise<void>;
  onParameter(context: Context): unknown | Promise<unknown>;
  output: FunctionOutput;
}

export function AzureFunctionAppOutput(configuration: AzureFunctionAppOutputConfiguration) {
  return (target: object | Function, propertyKey: string | symbol, parameterIndex: number) => {
    getMetadataArgsStorage().args('@azure:function-app:outputs', {
      target: typeof target === 'object' ? target.constructor : target,
      propertyKey,
      parameterIndex,
      onContext: configuration.onContext,
      output: configuration.output,
    });

    Parameter(configuration.onParameter)(target, propertyKey, parameterIndex);
  };
}

declare global {
  namespace Bluish {
    namespace Azure {
      namespace FunctionApp {
        interface OutputMetadataArgs extends MetadataArgs {
          propertyKey: string | symbol;
          parameterIndex: number;
          onContext(context: Context): void | Promise<void>;
          output: FunctionOutput;
        }
      }
    }

    interface HandlerMetadata {
      '@azure:function-app:on-context': ((context: Context) => void | Promise<void>)[];
    }

    interface MetadataArgsStorage {
      readonly '@azure:function-app:outputs': Azure.FunctionApp.OutputMetadataArgs[];
    }
  }
}
