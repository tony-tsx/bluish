import { Class } from './Class.js'

export type InjectableReference = string | symbol | (() => Class)
