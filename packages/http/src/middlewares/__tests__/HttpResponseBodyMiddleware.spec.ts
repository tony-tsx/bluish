import { expect, it } from 'vitest'
import http, { GET, HttpController } from '../../http.js'
import { Application } from '@bluish/core'
import { Json } from '../../modules/json.js'
import { UrlEncoded } from '../../modules/url-encoded.js'
import HttpTesting from '../../modules/testing.js'

it('content type quality priority', async () => {
  @HttpController('/root')
  class Root {
    @GET
    @UrlEncoded.ContentType({ quality: 0.5 })
    @Json.ContentType({ quality: 1 })
    public static get() {
      return { message: 'Hello, World!' }
    }
  }

  const application = await new Application()
    .useController(Root)
    .use(http())
    .bootstrap()

  const context = HttpTesting.toContext('/root', {
    headers: {
      Accept: 'application/x-www-form-urlencoded; q=1, application/json; q=1',
    },
  })

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('get')!
    .run(context)

  expect(context.response.headers['Content-Type']).toBe('application/json')
  expect(context.response.body).toBe('{"message":"Hello, World!"}')
})

it('content type quality priority', async () => {
  @HttpController('/root')
  class Root {
    @GET
    @UrlEncoded.ContentType({ q: 0.5 })
    @Json.ContentType({ q: 1 })
    public static get() {
      return { message: 'Hello, World!' }
    }
  }

  const application = await new Application()
    .useController(Root)
    .use(http())
    .bootstrap()

  const context = HttpTesting.toContext('/root', {
    headers: {
      Accept: 'application/x-www-form-urlencoded; q=1, application/json; q=0.8',
    },
  })

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('get')!
    .run(context)

  expect(context.response.headers['Content-Type']).toBe(
    'application/x-www-form-urlencoded',
  )
  expect(context.response.body).toBe('message=Hello%2C%20World!')
})

it('dont adds body if return is void', async () => {
  @HttpController('/root')
  class Root {
    @GET
    @Json.ContentType({ q: 1 })
    public static get() {}
  }

  const application = await new Application()
    .useController(Root)
    .use(http())
    .bootstrap()

  const context = HttpTesting.toContext('/root')

  await application.controllers
    .findByConstructable(Root)!
    .actions.findByStaticPropertyKey('get')!
    .run(context)

  expect(context.response.body).toBeUndefined()
})
