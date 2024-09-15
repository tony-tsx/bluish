import { it } from 'vitest'
import { HttpController } from '../HttpController.js'
import { GET } from '../Route.js'
import { Json } from '../../modules/json.js'

it('', () => {
  @HttpController('/testing')
  class Root {
    @GET
    @Json.ContentType()
    public get() {
      return { message: '' }
    }
  }
})
