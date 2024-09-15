import { expect, it } from 'vitest'
import { Version } from '../Version.js'
import { getMetadataArgsStorage } from '@bluish/core'
import { HTTP_VERSION } from '../../constants/constants.js'

it('adds version in metadata', () => {
  @Version('1.0')
  class Root {}

  expect(getMetadataArgsStorage().metadatas).toEqual([
    expect.objectContaining({
      target: Root,
      key: HTTP_VERSION,
      value: ['1.0'],
    }),
  ])
})
