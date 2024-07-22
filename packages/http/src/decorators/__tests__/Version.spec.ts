import { expect, it, vi } from 'vitest'
import { Controller } from '../Controller.js'
import { Version } from '../Version.js'
import { Application } from '@bluish/core'
import { GET } from '../Route.js'
import supertest from 'supertest'
import { toHttpServer } from '../../../.test/toHttpServer.js'

it('TODO', async () => {
  @Controller('/users')
  @Version(1)
  class UsersV1 {
    @GET
    public static list() {
      return []
    }
  }

  @Controller('/users')
  @Version(2)
  class UsersV2 {
    @GET
    public static list() {
      return []
    }
  }

  vi.spyOn(UsersV1, 'list')
  vi.spyOn(UsersV2, 'list')

  const application = await new Application()
    .register(UsersV1)
    .register(UsersV2)
    .initialize()

  await supertest(toHttpServer(application)).get('/v1/users').send().expect(200)

  expect(UsersV1.list).toHaveBeenCalledWith()

  expect(UsersV2.list).not.toHaveBeenCalled()

  await supertest(toHttpServer(application)).get('/v2/users').send().expect(200)

  expect(UsersV2.list).toHaveBeenCalledWith()

  expect(UsersV1.list).toHaveBeenCalledTimes(1)

  await supertest(toHttpServer(application)).get('/users').send().expect(200)

  expect(UsersV1.list).toHaveBeenCalledTimes(1)

  expect(UsersV2.list).toHaveBeenCalledTimes(2)
})
