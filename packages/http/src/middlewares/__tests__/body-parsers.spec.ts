import { describe, expect, it, vi } from 'vitest'
import { Application, Use } from '@bluish/core'
import supertest from 'supertest'
import { toHttpServer } from '../../../.test/toHttpServer.js'
import { UseBody } from '../../decorators/UseBody.js'
import { Controller } from '../../decorators/Controller.js'
import { POST } from '../../decorators/Route.js'
import { json } from '../body-parsers.js'

describe('JSON', () => {
  it('parse json in application middleware', async () => {
    @Controller('/users')
    class Users {
      @POST
      public static save(@UseBody body: any) {
        return [{ id: 1, ...body }]
      }
    }

    vi.spyOn(Users, 'save')

    const app = await new Application().use(json()).register(Users).initialize()

    await supertest(toHttpServer(app))
      .post('/users')
      .send({
        name: 'John Doe',
      })
      .expect(200)

    expect(Users.save).toHaveBeenCalledWith({ name: 'John Doe' })
  })

  it('parse json in controller middleware', async () => {
    const middleware = json()

    vi.spyOn(middleware, 'handle')

    @Controller('/users')
    @Use(middleware)
    class Users {
      @POST
      public static save(@UseBody body: any) {
        return [{ id: 1, ...body }]
      }
    }

    vi.spyOn(Users, 'save')

    const app = await new Application().register(Users).initialize()

    await supertest(toHttpServer(app))
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(200)

    expect(Users.save).toHaveBeenCalledWith({ name: 'John Doe' })
  })

  it('parse json in action middleware', async () => {
    @Controller('/users')
    class Users {
      @POST
      @Use(json())
      public static save(@UseBody body: any) {
        return [{ id: 1, ...body }]
      }
    }

    vi.spyOn(Users, 'save')

    const app = await new Application().register(Users).initialize()

    await supertest(toHttpServer(app))
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(200)

    expect(Users.save).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})
