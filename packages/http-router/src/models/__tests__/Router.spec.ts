import { expect, it, vi } from 'vitest'
import { Router } from '../Router.js'
import { Application } from '@bluish/core'
import { json } from '@bluish/http/json'
import http, { GET, HttpController } from '@bluish/http'
import BluishHttpTesting from '@bluish/http/testing'

it('', async () => {
  @HttpController('/users')
  class Users {
    @GET
    public static find() {
      return {}
    }
  }

  vi.spyOn(Users, 'find')

  const application = await new Application()
    .use(http())
    .use(json())
    .useController(Users)
    .bootstrap()

  const router = new Router(application)

  {
    const context = await router.run(
      BluishHttpTesting.toContext({ url: '/users' }),
    )

    expect(Users.find).toHaveBeenCalled()

    expect(context.response.status).toBe(200)
    expect(context.response.headers['Content-Type']).toBe('application/json')
    expect(context.response.headers['Content-Length']).toBe('2')
    expect(context.response.body.toString()).toBe('{}')
  }

  {
    const context = await router.run(
      BluishHttpTesting.toContext({ url: '/user' }),
    )

    expect(context.response.status).toBe(404)
    expect(context.response.body.toString()).toBe(
      '{"status":404,"message":"Not Found"}',
    )
  }
})

it('routing path ranking', async () => {
  @HttpController
  class MainController {
    @GET('/users')
    public static find() {
      return {}
    }

    @GET('/users/:userId')
    public static findOneById() {
      return {}
    }

    @GET('/users/all')
    public static findAll() {
      return {}
    }
  }

  vi.spyOn(MainController, 'find')
  vi.spyOn(MainController, 'findOneById')
  vi.spyOn(MainController, 'findAll')

  const application = await new Application()
    .use(http())
    .use(json())
    .useController(MainController)
    .bootstrap()

  const router = new Router(application)

  {
    const context = await router.run(
      BluishHttpTesting.toContext({ url: '/users/all' }),
    )

    expect(MainController.findAll).toHaveBeenCalledTimes(1)
    expect(MainController.findOneById).toHaveBeenCalledTimes(0)
    expect(context.action.propertyKey).toBe('findAll')
  }

  {
    const context = await router.run(
      BluishHttpTesting.toContext({ url: '/users/test' }),
    )

    expect(MainController.findOneById).toHaveBeenCalledTimes(1)
    expect(MainController.findAll).toHaveBeenCalledTimes(1)
    expect(context.action.propertyKey).toBe('findOneById')
  }
})
