/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpCookie, cookie, Cookie } from '../cookie.js'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpController } from '../../decorators/HttpController.js'
import { GET } from '../../decorators/Route.js'
import { UseMiddleware } from '@bluish/core'
import BluishCoreTesting from '@bluish/core/testing'
import 'reflect-metadata'
import BluishHttpTesting from '../testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

const run = BluishCoreTesting.run

describe('cookie middleware', () => {
  it('parse request cookie', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static test(cookie: HttpCookie) {}
    }

    vi.spyOn(Test, 'test')

    await run(
      Test,
      'test',
      BluishHttpTesting.toContext('/test', {
        headers: { Cookie: 'key=value' },
      }),
    )

    expect(Test.test).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'value',
      }),
    )
  })

  it('parse request cookie', async () => {
    @HttpController
    @UseMiddleware(cookie({}))
    class Test {
      @GET('/test')
      public static test(@Cookie('key') value: string) {}
    }

    vi.spyOn(Test, 'test')

    await run(
      Test,
      'test',
      BluishHttpTesting.toContext('/test', {
        headers: { Cookie: 'key=value' },
      }),
    )

    expect(Test.test).toHaveBeenCalledWith('value')
  })

  it('parse signed request cookie', async () => {
    @HttpController
    @UseMiddleware(cookie({ secret: 'super secret' }))
    class Test {
      @GET('/step')
      public static step(cookie: HttpCookie) {
        cookie.sign('key', 'value')
      }

      @GET('/test')
      public static test(cookie: HttpCookie) {}
    }

    vi.spyOn(Test, 'test')

    const { response } = await run(
      Test,
      'step',
      BluishHttpTesting.toContext('/step'),
    )

    await run(
      Test,
      'test',
      BluishHttpTesting.toContext('/test', {
        headers: { Cookie: response.headers['Set-Cookie']![0] },
      }),
    )

    expect(Test.test).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'value' }),
    )
  })
})

describe('cookie.set', () => {
  it('set request cookie', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value')
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value'],
      }),
    )
  })

  it('set request cookie http only', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { httpOnly: true })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; HttpOnly'],
      }),
    )
  })

  it('set request cookie max age 10', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { maxAge: 10 })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; Max-Age=10'],
      }),
    )
  })

  it('set request cookie secure', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { secure: true })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; Secure'],
      }),
    )
  })

  it('set request cookie same site strict', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { sameSite: 'Strict' })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; SameSite=Strict'],
      }),
    )
  })

  it('set request cookie same site lax', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { sameSite: 'Lax' })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; SameSite=Lax'],
      }),
    )
  })

  it('set request cookie same site none', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { sameSite: 'None' })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; SameSite=None'],
      }),
    )
  })

  it('set request cookie domain', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { domain: 'example.com' })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; Domain=example.com'],
      }),
    )
  })

  it('set request cookie path', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', { path: '/path' })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key=value; Path=/path'],
      }),
    )
  })

  it('set request cookie with multiple options', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key', 'value', {
          secure: true,
          httpOnly: true,
          maxAge: 10,
          sameSite: 'Strict',
          domain: 'example.com',
          path: '/path',
        })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': [
          'key=value; Domain=example.com; Path=/path; Max-Age=10; HttpOnly; Secure; SameSite=Strict',
        ],
      }),
    )
  })

  it('set request cookies with different keys', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key1', 'value1')
        cookie.set('key2', 'value2')
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key1=value1', 'key2=value2'],
      }),
    )
  })

  it('set request cookies with different keys and options', async () => {
    @HttpController
    @UseMiddleware(cookie())
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.set('key1', 'value1', { maxAge: 10 })
        cookie.set('key2', 'value2', { httpOnly: true })
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': ['key1=value1; Max-Age=10', 'key2=value2; HttpOnly'],
      }),
    )
  })
})

describe('cookie.sign', () => {
  it('sign cookie', async () => {
    @HttpController
    @UseMiddleware(cookie({ secret: 'super secret' }))
    class Test {
      @GET('/test')
      public static act(cookie: HttpCookie) {
        cookie.sign('key', 'value')
      }
    }

    const { response } = await run(
      Test,
      'act',
      BluishHttpTesting.toContext('/test'),
    )

    expect(response.headers).toEqual(
      expect.objectContaining({
        'Set-Cookie': [expect.stringMatching(/key=s%3Avalue\.\w+/)],
      }),
    )
  })
})
