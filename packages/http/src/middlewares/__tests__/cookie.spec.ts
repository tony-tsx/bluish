import { Cookie, cookie, UseCookie } from '../cookie.js'
import { describe, expect, it, vi } from 'vitest'
import { Controller } from '../../decorators/Controller.js'
import { GET } from '../../decorators/Route.js'
import { Application } from '@bluish/core'
import supertest from 'supertest'
import { toHttpServer } from '../../../.test/toHttpServer.js'
import { UseResponse } from '../../decorators/UseResponse.js'
import { Response } from '../../models/Response.js'

describe('cookie middleware', () => {
  it('parse request cookie', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    vi.spyOn(Test, 'act')

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .set('Cookie', 'key=value')
      .send()
      .expect(200)

    expect(Test.act).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'value',
      }),
      expect.anything(),
    )
  })

  it('parse request cookie', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie('key') value: string,
        @UseResponse response: Response,
      ) {
        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    vi.spyOn(Test, 'act')

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .set('Cookie', 'key=value')
      .send()
      .expect(200)

    expect(Test.act).toHaveBeenCalledWith('value', expect.anything())
  })

  it('parse signed request cookie', async () => {
    @Controller
    class Test {
      @GET('/step')
      public static step(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.sign('key', 'value', 'secret')

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }

      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    vi.spyOn(Test, 'act')

    const app = await new Application()
      .register(Test)
      .use(cookie({ secret: 'secret' })) // Enable signed cookies
      .initialize()

    const server = toHttpServer(app)

    const response = await supertest(server).get('/step').send()

    const signedCookie = response.headers['set-cookie'][0]

    await supertest(server)
      .get('/test')
      .set('Cookie', signedCookie)
      .send()
      .expect(200)

    expect(Test.act).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'value' }),
      expect.anything(),
    )
  })
})

describe('cookie.set', () => {
  it('set request cookie', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value')

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value')
  })

  it('set request cookie http only', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { httpOnly: true })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; HttpOnly')
  })

  it('set request cookie max age 10', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { maxAge: 10 })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; Max-Age=10')
  })

  it('set request cookie secure', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { secure: true })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; Secure')
  })

  it('set request cookie same site strict', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { sameSite: 'Strict' })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; SameSite=Strict')
  })

  it('set request cookie same site lax', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { sameSite: 'Lax' })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; SameSite=Lax')
  })

  it('set request cookie same site none', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { sameSite: 'None' })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; SameSite=None')
  })

  it('set request cookie domain', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { domain: 'example.com' })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; Domain=example.com')
  })

  it('set request cookie path', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', { path: '/path' })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key=value; Path=/path')
  })

  it('set request cookie with multiple options', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key', 'value', {
          secure: true,
          httpOnly: true,
          maxAge: 10,
          sameSite: 'Strict',
          domain: 'example.com',
          path: '/path',
        })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect(
        'Set-Cookie',
        'key=value; Domain=example.com; Path=/path; Max-Age=10; HttpOnly; Secure; SameSite=Strict',
      )
  })

  it('set request cookies with different keys', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key1', 'value1')
        cookie.set('key2', 'value2')

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key1=value1,key2=value2')
  })

  it('set request cookies with different keys and options', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.set('key1', 'value1', { maxAge: 10 })
        cookie.set('key2', 'value2', { httpOnly: true })

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({}))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', 'key1=value1; Max-Age=10,key2=value2; HttpOnly')
  })
})

describe('cookie.sign', () => {
  it('sign cookie', async () => {
    @Controller
    class Test {
      @GET('/test')
      public static act(
        @UseCookie cookie: Cookie,
        @UseResponse response: Response,
      ) {
        cookie.sign('key', 'value', 'mySecretKey')

        response.status = 200
        response.headers['Content-Type'] = 'text/plain'
        response.body = 'OK'
      }
    }

    const app = await new Application()
      .register(Test)
      .use(cookie({ secret: ['mySecretKey'] }))
      .initialize()

    await supertest(toHttpServer(app))
      .get('/test')
      .send()
      .expect(200)
      .expect('Set-Cookie', /key=s%3Avalue\.\w+/)
  })
})
