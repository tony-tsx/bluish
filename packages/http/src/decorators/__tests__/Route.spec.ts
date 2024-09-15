/* eslint-disable @typescript-eslint/no-unused-vars */
import supertest from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpSource } from '../HttpSource.js'
import { DELETE, GET, POST, PUT } from '../Route.js'
import { Application, Use } from '@bluish/core'
import { Body } from '../Body.js'
import { Param } from '../Param.js'
import BluishCoreTesting from '@bluish/core/testing'
import { HttpResponseBodyMiddleware } from '../../middlewares/HttpResponseBodyMiddleware.js'
import { HttpResponseStatusMiddleware } from '../../middlewares/HttpResponseStatusMiddleware.js'
import { HttpRequestParamsMiddleware } from '../../middlewares/HttpRequestParamsMiddleware.js'
import { json, Json } from '../../modules/json.js'
import HttpTesting from '../../modules/testing.js'

const { run } = BluishCoreTesting

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

describe('GET', () => {
  it('send /users request', async () => {
    @HttpSource('/users')
    @Json.ContentType()
    class Users {
      @GET
      public static find() {
        return [{ id: 1, name: 'John Doe' }]
      }
    }

    vi.spyOn(Users, 'find')

    await run(Users, 'find', HttpTesting.toContext('/users'))

    expect(Users.find).toHaveBeenCalledWith()
  })

  it('send /users/:user request', async () => {
    @HttpSource('/users')
    @Use(new HttpResponseBodyMiddleware())
    @Use(new HttpResponseStatusMiddleware())
    @Use(new HttpRequestParamsMiddleware())
    @Use(json())
    class Users {
      @GET('/:user')
      public static findById(@Param('user') id: string) {
        return { id, name: 'John Doe' }
      }
    }

    vi.spyOn(Users, 'findById')

    const context = await run(
      Users,
      'findById',
      HttpTesting.toContext('/users/1'),
    )

    expect(context.response.status).toBe(200)
    expect(context.response.headers).toEqual({
      'Content-Length': '28',
      'Content-Type': 'application/json',
    })
    expect(context.response.body).toBe(
      JSON.stringify({ id: '1', name: 'John Doe' }),
    )

    expect(Users.findById).toHaveBeenCalledWith('1')
  })
})

describe('POST', () => {
  it.skip('send /users request', async () => {
    @HttpSource('/users')
    @Json.ContentType()
    class Users {
      @POST
      public static insert(@Body body: any) {
        return { ...body, id: 1 }
      }
    }

    vi.spyOn(Users, 'insert')

    const app = await new Application()
      .use(json())
      .useController(Users)
      .bootstrap()

    /*
    await supertest(toHttpServer(app))
      .post('/users')
      .send({ name: 'John Doe' })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ id: 1, name: 'John Doe' })
    */

    expect(Users.insert).toHaveBeenCalledWith({ name: 'John Doe' })
  })
})

describe('PUT', () => {
  it.skip('send /users/:user request', async () => {
    @HttpSource('/users')
    @Json.ContentType()
    class Users {
      @PUT('/:user')
      public static update(@Param('user') id: string, @Body body: any) {
        return { ...body, id }
      }
    }

    vi.spyOn(Users, 'update')

    const app = await new Application()
      .use(json())
      .useController(Users)
      .bootstrap()

    /*
    await supertest(toHttpServer(app))
      .put('/users/1')
      .expect(200)
      .send({ name: 'John Doe' })
      .expect('Content-Type', /application\/json/)
      .expect({ id: '1', name: 'John Doe' })
    */

    expect(Users.update).toHaveBeenCalledWith('1', { name: 'John Doe' })
  })
})

describe('DELETE', () => {
  it.skip('send /users/:user request', async () => {
    @HttpSource('/users')
    @Json.ContentType()
    class Users {
      @DELETE('/:user')
      public static update(@Param('user') id: string) {
        return { id, name: 'John Doe', deletedAt: new Date() }
      }
    }

    vi.spyOn(Users, 'update')

    const app = await new Application()
      .use(json())
      .useController(Users)
      .bootstrap()

    /*
    const response = await supertest(toHttpServer(app))
      .delete('/users/1')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toEqual({
      id: '1',
      name: 'John Doe',
      deletedAt: expect.any(String),
    })
    */

    expect(Users.update).toHaveBeenCalledWith('1')
  })
})
