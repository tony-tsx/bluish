import { expect, it } from 'vitest'
import { Controller } from '../Controller.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'

it('adds controller in metadata args storage', () => {
  @Controller
  class TestController {}

  expect(getMetadataArgsStorage().controllers).toEqual([
    { target: TestController },
  ])
})

it('adds controller in metadataa args storage with inherit', () => {
  @Controller
  class TestInherit {}

  @Controller({ inherit: () => TestInherit })
  class TestController {}

  expect(getMetadataArgsStorage().controllers).toContainEqual(
    expect.objectContaining({
      target: TestController,
      inherit: expect.any(Function),
    }),
  )
})
