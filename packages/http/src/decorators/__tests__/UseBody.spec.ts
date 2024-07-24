import supertest from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { Controller } from '../Controller.js'
import { DELETE, GET, POST, PUT } from '../Route.js'
import { toHttpServer } from '../../../.test/toHttpServer.js'
import { Application } from '@bluish/core'
import { UseParam } from '../UseParam.js'
import { UseBody } from '../UseBody.js'
import { json } from '../../middlewares/body-parsers.js'

describe('GET', () => {
  it('send /users request', async () => {
    @Controller('/users')
    class Users {
      @GET
      public static find() {
        return [{ id: 1, name: 'John Doe' }]
      }
    }

    vi.spyOn(Users, 'find')

    const app = await new Application().register(Users).initialize()

    await supertest(toHttpServer(app))
      .get('/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect([{ id: 1, name: 'John Doe' }])

    expect(Users.find).toHaveBeenCalledWith()
  })

  it('send /users/:user request', async () => {
    @Controller('/users')
    class Users {
      @GET('/:user')
      public static findById(@UseParam('user') id: string) {
        return { id, name: 'John Doe' }
      }
    }

    vi.spyOn(Users, 'findById')

    const app = await new Application().register(Users).initialize()

    await supertest(toHttpServer(app))
      .get('/users/1')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ id: '1', name: 'John Doe' })

    expect(Users.findById).toHaveBeenCalledWith('1')
  })
})

describe('POST', () => {
  it.only('send /users request', async () => {
    @Controller('/users')
    class Users {
      @POST
      public static insert(@UseBody body: any) {
        return { ...body, id: 1 }
      }
    }

    vi.spyOn(Users, 'insert')

    const app = await new Application().use(json()).register(Users).initialize()

    await supertest(toHttpServer(app))
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ id: 1, name: 'John Doe' })

    expect(Users.insert).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})

describe('PUT', () => {
  it('send /users/:user request', async () => {
    @Controller('/users')
    class Users {
      @PUT('/:user')
      public static update(@UseParam('user') id: string, @UseBody body: any) {
        return { ...body, id }
      }
    }

    vi.spyOn(Users, 'update')

    const app = await new Application().use(json()).register(Users).initialize()

    await supertest(toHttpServer(app))
      .put('/users/1')
      .expect(200)
      .send({ name: 'John Doe' })
      .expect('Content-Type', /application\/json/)
      .expect({ id: '1', name: 'John Doe' })

    expect(Users.update).toHaveBeenCalledWith('1', { name: 'John Doe' })
  })
})

describe('DELETE', () => {
  it('send /users/:user request', async () => {
    @Controller('/users')
    class Users {
      @DELETE('/:user')
      public static update(@UseParam('user') id: string) {
        return { id, name: 'John Doe', deletedAt: new Date() }
      }
    }

    vi.spyOn(Users, 'update')

    const app = await new Application().use(json()).register(Users).initialize()

    const response = await supertest(toHttpServer(app))
      .delete('/users/1')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual({
      id: '1',
      name: 'John Doe',
      deletedAt: expect.any(String),
    })
    expect(Users.update).toHaveBeenCalledWith('1')
  })
})
