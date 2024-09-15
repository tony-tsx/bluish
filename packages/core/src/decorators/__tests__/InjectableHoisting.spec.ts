import { beforeEach, expect, it } from 'vitest'
import { InjectableHoisting } from '../InjectableHoisting.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'
import BluishCoreTesting from '../../core-testing.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage()
})

it('adds injectable hoisting in metadata args storage', () => {
  class Service {
    @InjectableHoisting
    public hosting = '123'
  }

  expect(getMetadataArgsStorage().injectableHoistings).toEqual([
    expect.objectContaining({
      target: Service.prototype,
      propertyKey: 'hosting',
    }),
  ])
})
