/* eslint-disable @typescript-eslint/no-unused-vars */
import http, {
  Body,
  DELETE,
  GET,
  HttpSource,
  Param,
  PATCH,
  PUT,
  Query,
  Res,
  POST,
} from '@bluish/http'
import { it } from 'vitest'
import supertest from 'supertest'
import { Application } from '@bluish/core'
import { Router } from '@bluish/http-router'
import { json } from '@bluish/http/json'
import { HttpServer } from '../HttpServer.js'
import { IHttpResponse } from '../../../../http/dist/esm/interfaces/IHttpResponse.js'

class User {
  constructor(public readonly id: string) {}
}

class Post {
  constructor(public readonly id: string) {}
}

@HttpSource('/users')
class Users {
  @Param(id => new User(id as string))
  public readonly user!: User

  @GET
  public find(@Query query: Record<string, string[]>) {
    return []
  }

  @PUT
  public save(@Body body: any) {}

  @PATCH
  public update(@Body body: any) {}

  @GET('/:user')
  public findOne() {}

  @DELETE('/:user')
  public remove() {}
}

@HttpSource('/posts')
class Posts {
  @Param(id => new Post(id as string))
  public readonly post!: Post

  @GET
  public find(@Query query: Record<string, string[]>, @Res res: IHttpResponse) {
    return []
  }

  @PUT
  public save(@Body body: any) {}

  @PATCH
  public update(@Body body: any) {}

  @GET('/:post')
  public findOne() {}

  @DELETE('/:post')
  public remove() {}
}

@HttpSource('/:user/posts', { inherits: { actions: false } })
class UserPosts extends Users {
  @GET
  public override find(@Query query: Record<string, string[]>) {
    return []
  }

  @POST
  public insert(@Query query: Record<string, string[]>) {
    return []
  }
}

const application = await new Application({
  controllers: [Users, Posts, UserPosts],
})
  .use(http())
  .use(json())
  .bootstrap()

const server = new HttpServer(new Router(application))

const agent = supertest(server)

it('404', async () => {
  await agent.get('/non-exists').expect(404)
})

it('GET /users', async () => {
  await agent
    .get('/users')
    .expect('Content-Type', 'application/json')
    .expect(200)
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
