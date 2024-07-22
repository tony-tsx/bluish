import { Module } from './Module.js'
import { Runner } from './Runner.js'

export class Context {
  public readonly module: Module = new Module(this)

  public readonly target!: Record<string | symbol, unknown>

  public readonly runner!: Runner

  public readonly return!: any
}

export interface Context extends Bluish.Context {
  [key: string]: unknown
  [key: number]: unknown
  [key: symbol]: unknown
}

declare global {
  namespace Bluish {
    interface Context {}
  }
}
