import { beforeEach, expect, it, vi } from 'vitest'
import { Pipe } from '../Pipe.js'
import BluishCoreTesting from '../../core-testing.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds controller pipe in metadata args storage', () => {
  const pipe = vi.fn()

  @Pipe(pipe)
  class Root {}

  expect(getMetadataArgsStorage().pipes).toEqual([{ target: Root, pipe }])
})

it('adds controller action pipe in metadata args storage', () => {
  const pipe = vi.fn()

  class Root {
    @Pipe(pipe)
    public static action() {}
  }

  expect(getMetadataArgsStorage().pipes).toEqual([
    {
      target: Root,
      pipe,
      propertyKey: 'action',
      description: expect.anything(),
    },
  ])
})
