import '../typings/global.js';
import {
  BeforeHandlerExecuteEvent,
  HandlerExecuteErrorEvent,
  HandlerExecuteFinishEvent,
  Middleware,
} from '@bluish/core';
import { HttpRequest, KnownSeverityLevel, TelemetryClient, startOperation } from 'applicationinsights';
import { ICorrelationContext } from 'applicationinsights/out/src/shim/types.js';

import { AzureFunctionAppRequest } from '../models/AzureFunctionAppRequest.js';

export interface ApplicationInsightsMiddlewareOptions {}

export class ApplicationInsightsMiddleware extends Middleware {
  public telemetry: TelemetryClient;

  constructor(connectionString: string) {
    super();

    this.telemetry = new TelemetryClient(connectionString);
  }

  public onInitialize(): void | Promise<void> {}

  public onBefore(event: BeforeHandlerExecuteEvent): void | Promise<void> {
    event.context.startAt = new Date();

    event.context.telemetry = this.telemetry;

    if (event.context instanceof AzureFunctionAppRequest)
      event.context.correlation = startOperation(
        event.context.invocationContext,
        event.context._httpRequest as unknown as HttpRequest,
      );
    else event.context.correlation = startOperation(event.context.invocationContext);
  }

  public onError(event: HandlerExecuteErrorEvent): void | Promise<void> {
    this.telemetry.trackException({
      exception: event.error as Error,
      properties: {},
      measurements: {},
      time: event.createdAt,
      severity: KnownSeverityLevel.Error,
    });
  }

  public onFinish(event: HandlerExecuteFinishEvent): void | Promise<void> {
    const isHttp = event.context instanceof AzureFunctionAppRequest;

    this.telemetry.trackRequest({
      id: event.context.correlation?.operation.parentId,
      name: event.context.invocationContext.functionName,
      url: isHttp ? event.context._httpRequest.url : undefined,
      duration: event.context.startAt.getTime() - Date.now(),
      resultCode: isHttp ? event.context._res.status.toString() : '0',
      success: isHttp ? event.context._res.status() < 500 : true,
      time: event.context.startAt,
      measurements: {},
      properties: {},
    });
  }
}

declare global {
  namespace Bluish {
    interface Context {
      telemetry: TelemetryClient;
      correlation: ICorrelationContext | null;
      startAt: Date;
    }
  }
}
