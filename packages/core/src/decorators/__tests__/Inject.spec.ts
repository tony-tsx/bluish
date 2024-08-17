import { beforeEach, describe, expect, it } from 'vitest'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'
import { Inject } from '../Inject.js'
import BluishCoreTesting from '../../core-testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds static inject property in metadata args storage', async () => {
  const ref = () => String
  class Root {
    @Inject(ref)
    public static readonly inject: string
  }

  expect(getMetadataArgsStorage().injects).toEqual([
    { target: Root, propertyKey: 'inject', ref },
  ])
})

it('adds inject property in metadata args storage', async () => {
  const ref = () => String
  class Root {
    @Inject(ref)
    public readonly inject!: string
  }

  expect(getMetadataArgsStorage().injects).toEqual([
    { target: Root.prototype, propertyKey: 'inject', ref },
  ])
})

it('adds multiple inject properties in metadata args storage', async () => {
  const ref1 = () => String
  const ref2 = () => Number
  class Root {
    @Inject(ref1)
    public static readonly inject1: string

    @Inject(ref2)
    public readonly inject2!: number
  }

  expect(getMetadataArgsStorage().injects).toEqual([
    { target: Root, propertyKey: 'inject1', ref: ref1 },
    { target: Root.prototype, propertyKey: 'inject2', ref: ref2 },
  ])
})

it('adds inject property with parameter index in metadata args storage', async () => {
  const ref = () => String
  class Root {
    constructor(@Inject(ref) public readonly inject: string) {}
  }

  expect(getMetadataArgsStorage().injects).toEqual([
    { target: Root, parameterIndex: 0, ref },
  ])
})

describe('reflect metadata', async () => {
  await import('reflect-metadata')

  it('adds property type ref in static inject property', async () => {
    class Root {
      @Inject
      public static readonly inject: string
    }

    expect(getMetadataArgsStorage().injects).toEqual([
      { target: Root, propertyKey: 'inject', ref: expect.any(Function) },
    ])
    expect(getMetadataArgsStorage().injects[0].ref()).toBe(String)
  })

  it('adds property type ref in inject property', async () => {
    class Root {
      @Inject
      public readonly inject!: string
    }

    expect(getMetadataArgsStorage().injects).toEqual([
      {
        target: Root.prototype,
        propertyKey: 'inject',
        ref: expect.any(Function),
      },
    ])
    expect(getMetadataArgsStorage().injects[0].ref()).toBe(String)
  })

  it('adds property type ref in inject constructor arguments', async () => {
    class Root {
      constructor(@Inject public readonly inject: string) {}
    }

    expect(getMetadataArgsStorage().injects).toEqual([
      {
        target: Root,
        parameterIndex: 0,
        ref: expect.any(Function),
      },
    ])
    expect(getMetadataArgsStorage().injects[0].ref()).toBe(String)
  })

  it('adds property type ref in inject action arguments', async () => {
    class Root {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      action(@Inject inject: string) {}
    }

    expect(getMetadataArgsStorage().injects).toEqual([
      {
        target: Root.prototype,
        propertyKey: 'action',
        parameterIndex: 0,
        ref: expect.any(Function),
      },
    ])
    expect(getMetadataArgsStorage().injects[0].ref()).toBe(String)
  })
})
