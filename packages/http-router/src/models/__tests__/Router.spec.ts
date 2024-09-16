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
    expect(context.response.body).toBe('{}')
  }

  {
    const context = await router.run(
      BluishHttpTesting.toContext({ url: '/user' }),
    )

    expect(context.response.status).toBe(404)
    expect(context.response.body).toBe('Not Found')
  }
})
