import { Constructable } from '../typings/Class.js'
import { Inject } from './Inject.js'
import { Injectable } from './Injectable.js'

export type Next = () => Promise<unknown>

export function Next(
  target: Constructable | object,
  propertyKey: undefined | string | symbol,
  parameterIndex: number,
) {
  Inject(() => Next)(target, propertyKey, parameterIndex)
}

Injectable.register(Next, 'context', context => () => context.next())
