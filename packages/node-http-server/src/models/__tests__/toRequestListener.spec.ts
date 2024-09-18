/* eslint-disable @typescript-eslint/no-unused-vars */
import http, {
  Body,
  DELETE,
  GET,
  HttpController,
  Param,
  PATCH,
  PUT,
  Query,
  Res,
  POST,
  IHttpResponse,
} from '@bluish/http'
import { beforeEach, it, vi } from 'vitest'
import supertest from 'supertest'
import { Application } from '@bluish/core'
import { Router } from '@bluish/http-router'
import { json } from '@bluish/http/json'
import { NodeHttpServer } from '../NodeHttpServer.js'
import { Readable } from 'node:stream'

class User {
  constructor(public readonly id: string) {}
}

class Post {
  constructor(public readonly id: string) {}
}

@HttpController('/users')
class Users {
  @Param(id => new User(id as string))
  public readonly user!: User

  @GET
  public static find(
    @Query query: Record<string, string[]>,
    @Res res: IHttpResponse,
  ): unknown {
    return []
  }

  @PUT
  public static save(@Body body: any) {}

  @PATCH
  public static update(@Body body: any) {}

  @GET('/:user')
  public static findOne() {}

  @DELETE('/:user')
  public static remove() {}
}

@HttpController('/posts')
class Posts {
  @Param(id => new Post(id as string))
  public readonly post!: Post

  @GET
  public find(@Query query: Record<string, string[]>, @Res res: IHttpResponse) {
    return []
  }

  @PUT
  public save(@Body body: any, @Res res: IHttpResponse) {
    res.status = 201
    return body
  }

  @PATCH
  public update(@Body body: any) {}

  @GET('/:post')
  public findOne() {}

  @DELETE('/:post')
  public remove() {}
}

@HttpController('/:user/posts', { inherits: { actions: false } })
class UserPosts extends Users {
  @GET
  public static override find(@Query query: Record<string, string[]>) {
    return []
  }

  @POST
  public static insert(@Query query: Record<string, string[]>) {
    return []
  }
}

const application = await new Application({
  controllers: [Users, Posts, UserPosts],
})
  .use(http())
  .use(json())
  .bootstrap()

const server = new NodeHttpServer(new Router(application))

const agent = supertest(server)

it('404', async () => {
  await agent.get('/non-exists').expect(404)
})

it('GET /users', async () => {
  await agent
    .get('/users')
    .expect('Content-Type', 'application/json')
    .expect(200)
    .expect('[]')
})

it('GET /users', async () => {
  vi.spyOn(Users, 'find').mockResolvedValue([{ username: 'John Doe' }])

  await agent
    .get('/users')
    .expect('Content-Type', 'application/json')
    .expect(200)
    .expect('[{"username":"John Doe"}]')
})

it('GET /users', async () => {
  vi.spyOn(Users, 'find').mockImplementationOnce(async (_, res) => {
    res.body = null
  })

  await agent.get('/users').expect(204)
})

it('GET /users/007/posts', async () => {
  await agent
    .get('/users/007/posts')
    .expect('Content-Type', 'application/json')
    .expect(200)
})

it('GET /posts', async () => {
  await agent.get('/posts').expect(200)
})

it('POST /users/007/posts', async () => {
  await agent.post('/users/007/posts').expect(200)
})

it.skip('PUT /users', async () => {
  let json = JSON.stringify({
    name: 'John Doe',
    email: 'john.doe@email.com',
  })

  const stream = new Readable({
    read() {},
  })

  const r = agent.put('/users').send().expect(201).expect({
    name: 'John Doe',
    email: 'john.doe@email.com',
  })

  do {
    const chunk = json.slice(0, 2)
    json = json.slice(2)

    stream.push(chunk)
    await new Promise(resolve => setTimeout(resolve, 10))
  } while (json.length)

  await r
})
