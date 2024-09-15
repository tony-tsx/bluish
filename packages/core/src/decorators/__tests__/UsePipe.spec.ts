import { beforeEach, expect, it, vi } from 'vitest'
import { UsePipe } from '../UsePipe.js'
import BluishCoreTesting from '../../core-testing.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds controller pipe in metadata args storage', () => {
  const pipe = vi.fn()

  @UsePipe(pipe)
  class Root {}

  expect(getMetadataArgsStorage().pipes).toEqual([
    expect.objectContaining({ target: Root, pipe }),
  ])
})

it('adds controller action pipe in metadata args storage', () => {
  const pipe = vi.fn()

  class Root {
    @UsePipe(pipe)
    public static action() {}
  }

  expect(getMetadataArgsStorage().pipes).toEqual([
    expect.objectContaining({
      target: Root,
      pipe,
      propertyKey: 'action',
      propertyDescriptor: expect.anything(),
    }),
  ])
})
