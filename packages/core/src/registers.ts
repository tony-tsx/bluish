import { Application } from './models/Application.js'
import { Injectable } from './decorators/Injectable.js'
import { Context } from './models/Context.js'

Injectable.register(Context, 'context', context => context)
Injectable.register(Application, 'context', context => context.application)
