import BluishCoreTesting from '@bluish/core/testing'
import { beforeEach, describe, expect, it } from 'vitest'
import { HttpSource } from '../HttpSource.js'
import { GET } from '../Route.js'
import { Param } from '../Param.js'
import { Use } from '@bluish/core'
import { HttpRequestParamsMiddleware } from '../../middlewares/HttpRequestParamsMiddleware.js'
import HttpTesting from '../../modules/testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds param in controller property', async () => {
  @HttpSource('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    @Param
    public readonly param!: string

    @GET('/:param')
    public action() {}
  }

  const context = HttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe('123')
})

it('adds param in controller property and transform it', async () => {
  @HttpSource('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    @Param(value => Number(value))
    public readonly param!: number

    @GET('/:param')
    public action() {}
  }

  const context = HttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe(123)
})

it('adds param in controller argument', async () => {
  @HttpSource('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    constructor(
      @Param('param')
      public readonly param: string,
    ) {}

    @GET('/:param')
    public action() {}
  }

  const context = HttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe('123')
})

it('adds param in controller argument and transform it', async () => {
  @HttpSource('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    constructor(
      @Param('param', value => Number(value))
      public readonly param: number,
    ) {}

    @GET('/:param')
    public action() {}
  }

  const context = HttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe(123)
})

describe('reflect metadata', async () => {
  await import('reflect-metadata')

  it('adds param in controller property and transform it', async () => {
    @HttpSource('/testing')
    @Use(new HttpRequestParamsMiddleware())
    class Root {
      @Param
      public readonly param!: number

      @GET('/:param')
      public action() {}
    }

    const context = HttpTesting.toContext('/testing/123')

    await BluishCoreTesting.run(Root.prototype, 'action', context)

    expect(context.request.params).toEqual({ param: '123' })
    expect(context.target.param).toBe(123)
  })

  it('adds param in controller argument and transform it', async () => {
    @HttpSource('/testing')
    @Use(new HttpRequestParamsMiddleware())
    class Root {
      constructor(@Param('param') public readonly param: number) {}

      @GET('/:param')
      public action() {}
    }

    const context = HttpTesting.toContext('/testing/123')

    await BluishCoreTesting.run(Root.prototype, 'action', context)

    expect(context.request.params).toEqual({ param: '123' })
    expect(context.target.param).toBe(123)
  })
})
