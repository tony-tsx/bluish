import { it } from 'vitest'
import { HttpSource } from '../HttpSource.js'
import { GET } from '../Route.js'
import { Json } from '../../modules/json.js'

it('', () => {
  @HttpSource('/testing')
  class Root {
    @GET
    @Json.ContentType()
    public get() {
      return { message: '' }
    }
  }
})
