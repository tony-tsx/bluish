import { ApplicationSourceAction } from './ApplicationSourceAction.js'
import { Module } from './Module.js'

export class Context {
  public readonly action!: ApplicationSourceAction

  public readonly module: Module = new Module(this)

  public readonly target!: any

  public readonly return!: any
}

export interface Context extends Bluish.Context {
  [key: string]: any
  [key: number]: any
  [key: symbol]: any
}

declare global {
  namespace Bluish {
    interface Context {}
  }
}
