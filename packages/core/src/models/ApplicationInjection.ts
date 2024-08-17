import { ApplicationSourceInject } from './ApplicationSourceInject.js'
import { Module } from './Module.js'

export class ApplicationInjection {
  constructor(
    public readonly inject: ApplicationSourceInject,
    public readonly module: Module,
    public value: any,
  ) {}
}
