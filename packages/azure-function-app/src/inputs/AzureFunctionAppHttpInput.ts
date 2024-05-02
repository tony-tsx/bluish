import { Readable } from 'stream';

import { app, HttpRequest, InvocationContext, HttpMethod, FunctionOutput } from '@azure/functions';
import { Context, ActionMetadata, Runner } from '@bluish/core';

import { AzureFunctionAppInput } from '../models/AzureFunctionAppInput.js';

export class AzureFunctionAppHttpInput extends AzureFunctionAppInput {
  public test(handler: ActionMetadata): boolean {
    return handler.is('http');
  }

  public register(runner: Runner<'http'>, outputs: FunctionOutput[]) {
    const propertyName =
      typeof runner.action.propertyKey === 'symbol'
        ? `SYMBOL_${runner.action.propertyKey.description}`
        : runner.action.propertyKey;

    const route = runner.action['@http:path']?.replace(/^\//, '');

    app.http(`HTTP_${runner.action.controller.target.name}${runner.action.isStatic ? '__' : '_'}${propertyName}`, {
      authLevel: 'function',
      methods: runner.action.args['@http:methods'].map(string => string.toUpperCase()) as HttpMethod[],
      handler: runner.toFunction(),
      extraOutputs: outputs,
      route,
    });
  }

  public async toContext(
    runner: Runner,
    httpRequest: HttpRequest,
    invocationContext: InvocationContext,
  ): Promise<Context> {
    const { AzureFunctionAppRequest } = await import('../models/AzureFunctionAppRequest.js');

    const request = new AzureFunctionAppRequest();

    request.invocationContext = invocationContext;

    // @ts-expect-error: is readonly
    request._httpRequest = httpRequest;

    request.body = httpRequest.body ? Readable.fromWeb(httpRequest.body) : null;

    request.headers = Object.fromEntries(httpRequest.headers);

    request.params = httpRequest.params;

    request.url = httpRequest.url;

    return request;
  }

  public toReturn(payload: any, context: import('../models/AzureFunctionAppRequest.js').AzureFunctionAppRequest) {
    if (typeof payload !== 'object' || payload === null) return context._res.send(payload).toAzureHttpResponse();

    if (payload.constructor !== Object) {
      if ('toJSON' in payload && typeof payload.toJSON === 'function')
        return context._res.json(payload.toJSON()).toAzureHttpResponse();

      return context._res.json(payload).toAzureHttpResponse();
    }

    if (
      !(
        typeof payload.status === 'number' ||
        (typeof payload.headers === 'object' && payload.headers !== null) ||
        payload.body !== undefined
      )
    )
      return context._res.json(payload).toAzureHttpResponse();

    if (typeof payload.status === 'number') context._res.status(payload.status);

    if (typeof payload.headers === 'object')
      Object.entries(payload.headers ?? {}).forEach(
        ([name, value]) => typeof value === 'string' && context._res.header(name, value),
      );

    if (payload.body === undefined) return context._res.toAzureHttpResponse();

    if (payload.body.constructor !== Object) {
      if ('toJSON' in payload.body && typeof payload.body.toJSON === 'function')
        return context._res.json(payload.body.toJSON()).toAzureHttpResponse();

      return context._res.json(payload.body).toAzureHttpResponse();
    }

    return context._res.json(payload.body).toAzureHttpResponse();
  }
}
