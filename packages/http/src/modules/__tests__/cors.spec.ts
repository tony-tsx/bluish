import HttpTesting from '../testing.js'
import CoreTesting from '@bluish/core/testing'
import { expect, it, vi } from 'vitest'
import { cors } from '../cors.js'

it('adds access control allow origin *', async () => {
  const context = HttpTesting.toContext()

  await CoreTesting.runMiddleware(cors(), context)

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe('*')
})

it('adds access control allow origin with origin', async () => {
  const context = HttpTesting.toContext()

  await CoreTesting.runMiddleware(
    cors({ origin: 'https://example.com' }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe(
    'https://example.com',
  )
})

it('adds access control allow origin with function', async () => {
  const context = HttpTesting.toContext()

  await CoreTesting.runMiddleware(
    cors({ origin: () => 'https://example.com' }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe(
    'https://example.com',
  )
})

it('adds access control allow multiple origin', async () => {
  const context = HttpTesting.toContext({
    headers: { Origin: 'https://example.com' },
  })

  await CoreTesting.runMiddleware(
    cors({ origin: ['https://example.com', 'https://example.org'] }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe(
    'https://example.com',
  )
})

it('adds access control allow multiple origin with function', async () => {
  const context = HttpTesting.toContext({
    headers: { Origin: 'https://example.org' },
  })

  await CoreTesting.runMiddleware(
    cors({ origin: context => [context.request.headers.origin!] }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe(
    'https://example.org',
  )
})

it('adds access control allow origin false', async () => {
  const context = HttpTesting.toContext({
    headers: { Origin: 'https://example.com' },
  })

  await CoreTesting.runMiddleware(
    cors({ origin: ['https://example.org', 'https://example.io'] }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe('false')
})

it('adds access control allow origin with regexp', async () => {
  const context = HttpTesting.toContext({
    headers: { Origin: 'https://example.com' },
  })

  await CoreTesting.runMiddleware(
    cors({ origin: /^https?:\/\/example\.(com|org)$/ }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Origin']).toBe(
    'https://example.com',
  )
})

it('allow credentials', async () => {
  const context = HttpTesting.toContext()

  await CoreTesting.runMiddleware(cors({ credentials: true }), context)

  expect(context.response.headers['Access-Control-Allow-Credentials']).toBe(
    'true',
  )
})

it('configure expose headers', async () => {
  const context = HttpTesting.toContext()

  await CoreTesting.runMiddleware(
    cors({ exposedHeaders: ['X-Example'] }),
    context,
  )

  expect(context.response.headers['Access-Control-Expose-Headers']).toEqual([
    'X-Example',
  ])
})

it('configure allowed methods', async () => {
  const context = HttpTesting.toContext({
    method: 'OPTIONS',
  })

  await CoreTesting.runMiddleware(
    cors({ allowMethods: ['GET', 'POST'] }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Methods']).toEqual([
    'GET',
    'POST',
  ])
})

it('configure allowed headers', async () => {
  const context = HttpTesting.toContext({
    method: 'OPTIONS',
    headers: { 'Access-Control-Request-Headers': 'X-Example' },
  })

  await CoreTesting.runMiddleware(
    cors({ allowHeaders: ['X-Example'] }),
    context,
  )

  expect(context.response.headers['Access-Control-Allow-Headers']).toEqual([
    'X-Example',
  ])
})

it('configure max age', async () => {
  const context = HttpTesting.toContext({
    method: 'OPTIONS',
  })

  await CoreTesting.runMiddleware(cors({ maxAge: 3600 }), context)

  expect(context.response.headers['Access-Control-Max-Age']).toBe('3600')
})

it('continue preflight', async () => {
  const context = HttpTesting.toContext({
    method: 'OPTIONS',
  })

  const next = vi.fn()

  await CoreTesting.runMiddleware(
    cors({ preflightContinue: true }),
    context,
    next,
  )

  expect(next).toHaveBeenCalled()
})
