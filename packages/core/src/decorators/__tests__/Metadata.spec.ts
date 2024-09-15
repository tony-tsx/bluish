import { beforeEach, expect, it } from 'vitest'
import { Metadata } from '../Metadata.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'
import BluishCoreTesting from '../../core-testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds controller metadata in metadata args storage', () => {
  @Metadata('isTest', true)
  class Root {}

  expect(getMetadataArgsStorage().metadatas).toEqual([
    expect.objectContaining({ target: Root, key: 'isTest', value: true }),
  ])
})

it('adds controller action metadata in metadata args storage', () => {
  class Root {
    @Metadata('isTest', true)
    public static action() {}
  }

  expect(getMetadataArgsStorage().metadatas).toEqual([
    expect.objectContaining({
      target: Root,
      propertyKey: 'action',
      key: 'isTest',
      value: true,
    }),
  ])
})
