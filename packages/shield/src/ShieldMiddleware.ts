import {
  ActionInitializeEvent,
  ActionMetadata,
  Context,
  ControllerMetadata,
  Middleware,
  getMetadataArgsStorage,
  tools,
} from '@bluish/core';

import { ShiledTestError } from './errors/ShieldTestError.js';
import { ShieldScopeError } from './errors/ShieldScopeError.js';
import { ShieldTokenError } from './errors/ShieldTokenError.js';
import { Token } from './interfaces/Token.js';

export interface ShieldMiddlewareConfiguration {
  getToken(context: Context): Token | undefined | null | false | Promise<Token | undefined | null | false>;
  onScope?(scope: string): unknown;
  onCatch?(scope: string): void;
}

export class ShieldMiddleware extends Middleware {
  constructor(public readonly configuration: ShieldMiddlewareConfiguration) {
    super();
  }

  public onController(controller: ControllerMetadata): void | Promise<void> {
    const scopes = getMetadataArgsStorage()
      .args('@shield:scopes')
      .filter(args => !args.propertyKey && tools.isMetadataArgumentFor(args, controller.target))
      .map(args => args.scope);

    const tests = getMetadataArgsStorage()
      .args('@shield:tests')
      .filter(args => !args.propertyKey && tools.isMetadataArgumentFor(args, controller.target))
      .map(args => args.test);

    const isProtected =
      scopes.length > 0 ||
      tests.length > 0 ||
      getMetadataArgsStorage()
        .args('@shield:protects')
        .some(args => !args.propertyKey && tools.isMetadataArgumentFor(args, controller.target));

    Object.defineProperty(controller, '@shield:scopes', {
      value: scopes,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    Object.defineProperty(controller, '@shield:tests', {
      value: tests,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    Object.defineProperty(controller, '@shield:isProtected', {
      value: isProtected,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  public onAction(action: ActionMetadata): void | Promise<void> {
    const scopes = getMetadataArgsStorage()
      .args('@shield:scopes')
      .filter(args => tools.isMetadataArgumentWithPropertyKeyFor(args, action))
      .map(args => args.scope);

    const tests = getMetadataArgsStorage()
      .args('@shield:tests')
      .filter(args => tools.isMetadataArgumentWithPropertyKeyFor(args, action))
      .map(args => args.test);

    const isProtected =
      scopes.length > 0 ||
      tests.length > 0 ||
      getMetadataArgsStorage()
        .args('@shield:protects')
        .some(args => tools.isMetadataArgumentWithPropertyKeyFor(args, action));

    Object.defineProperty(action, '@shield:scopes', {
      value: scopes,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    Object.defineProperty(action, '@shield:tests', {
      value: tests,
      enumerable: true,
      configurable: false,
      writable: false,
    });

    Object.defineProperty(action, '@shield:isProtected', {
      value: isProtected,
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }

  public async onInitialize(event: ActionInitializeEvent): Promise<void> {
    if (!event.context.runner.action['@shield:isProtected']) return;

    const token = await this.configuration.getToken(event.context);

    if (!token) throw new ShieldTokenError();

    for (const scope of event.context.runner.action.controller['@shield:scopes'])
      if (!token.scopes.includes(scope)) throw new ShieldScopeError(scope);

    for (const test of event.context.runner.action.controller['@shield:tests']) {
      const result = await test(token, event.context);

      if (!result) throw new ShiledTestError('test failed');

      if (typeof result === 'string') throw new ShiledTestError(result);
    }

    for (const scope of event.context.runner.action['@shield:scopes'])
      if (!token.scopes.includes(scope)) throw new ShieldScopeError(scope);

    for (const test of event.context.runner.action['@shield:tests']) {
      const result = await test(token, event.context);

      if (!result) throw new ShiledTestError('test failed');

      if (typeof result === 'string') throw new ShiledTestError(result);
    }
  }
}

export interface IShieldScopeMetadataArgs {
  target: Function | object;
  propertyKey?: string | symbol;
  scope: string;
}

export interface IShieldTestMetadataArgs {
  target: Function | object;
  propertyKey?: string | symbol;
  test: (token: Token, context: Context) => boolean | string | Promise<boolean | string>;
}

export interface IShieldProtectMetadataArgs {
  target: Function | object;
  propertyKey?: string | symbol;
}

declare global {
  namespace Bluish {
    namespace Shield {
      interface Token {}
    }

    interface ControllerMetadata {
      readonly '@shield:scopes': string[];
      readonly '@shield:tests': ((token: Token, context: Context) => boolean | string | Promise<boolean | string>)[];
      readonly '@shield:isProtected': boolean;
    }

    interface ActionMetadata {
      readonly '@shield:scopes': string[];
      readonly '@shield:tests': ((token: Token, context: Context) => boolean | string | Promise<boolean | string>)[];
      readonly '@shield:isProtected': boolean;
    }

    interface MetadataArgsStorage {
      readonly '@shield:protects': readonly IShieldProtectMetadataArgs[];
      readonly '@shield:scopes': readonly IShieldScopeMetadataArgs[];
      readonly '@shield:tests': readonly IShieldTestMetadataArgs[];
    }
  }
}
