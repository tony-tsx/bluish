import { expect, it } from 'vitest'
import { Controller } from '../Controller.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'

it('adds controller in metadata args storage', () => {
  @Controller
  class TestController {}

  expect(getMetadataArgsStorage().controllers).toEqual([
    expect.objectContaining({ target: TestController }),
  ])
})
