import BluishCoreTesting from '@bluish/core/testing'
import { beforeEach, expect, it } from 'vitest'
import { HttpController } from '../HttpController.js'
import { GET } from '../Route.js'
import { Param } from '../Param.js'
import { Use } from '@bluish/core'
import { HttpRequestParamsMiddleware } from '../../middlewares/HttpRequestParamsMiddleware.js'
import BluishHttpTesting from '../../modules/testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds param in controller property', async () => {
  @HttpController('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    @Param
    public readonly param!: string

    @GET('/:param')
    public action() {}
  }

  const context = BluishHttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe('123')
})

it('adds param in controller property and transform it', async () => {
  @HttpController('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    @Param(value => Number(value))
    public readonly param!: number

    @GET('/:param')
    public action() {}
  }

  const context = BluishHttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe(123)
})

it('adds param in controller argument', async () => {
  @HttpController('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    constructor(
      @Param('param')
      public readonly param: string,
    ) {}

    @GET('/:param')
    public action() {}
  }

  const context = BluishHttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe('123')
})

it('adds param in controller argument and transform it', async () => {
  @HttpController('/testing')
  @Use(new HttpRequestParamsMiddleware())
  class Root {
    constructor(
      @Param('param', value => Number(value))
      public readonly param: number,
    ) {}

    @GET('/:param')
    public action() {}
  }

  const context = BluishHttpTesting.toContext('/testing/123')

  await BluishCoreTesting.run(Root.prototype, 'action', context)

  expect(context.request.params).toEqual({ param: '123' })
  expect(context.target.param).toBe(123)
})
