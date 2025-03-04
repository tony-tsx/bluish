import { expect, it } from 'vitest'
import { HttpController } from '../HttpController.js'
import { GET } from '../Route.js'
import { Json } from '../../modules/json.js'
import BluishHttpTesting from '../../modules/testing.js'
import BluishCoreTesting from '@bluish/core/testing'
import { Use } from '@bluish/core'
import http from '../../http.js'

it('return json content', async () => {
  @HttpController('/testing')
  @Use(http())
  class Root {
    @GET
    @Json.ContentType()
    public action() {
      return { message: 'Hello World' }
    }
  }

  const context = BluishHttpTesting.toContext('/testing')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.response.headers).toEqual({
    'Content-Type': 'application/json',
    'Content-Length': '25',
  })

  expect(context.response.body.toString()).toBe('{"message":"Hello World"}')
})
