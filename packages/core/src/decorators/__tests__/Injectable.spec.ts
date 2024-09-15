import { beforeEach, expect, it } from 'vitest'
import { Injectable } from '../Injectable.js'
import BluishCoreTesting from '../../core-testing.js'
import { getMetadataArgsStorage } from '../../models/MetadataArgsStorage.js'

beforeEach(() => {
  BluishCoreTesting.resetMetadataArgsStorage(true)
})

it('adds injectable class in metadata args storage', () => {
  @Injectable
  class Service {}

  expect(getMetadataArgsStorage().injectables).toEqual([
    expect.objectContaining({
      target: Service,
      ref: Service,
      scope: 'singleton',
    }),
  ])
})

it('adds injectable class (scope: context) in metadata args storage', () => {
  @Injectable('context')
  class Service {}

  expect(getMetadataArgsStorage().injectables).toEqual([
    expect.objectContaining({
      target: Service,
      ref: Service,
      scope: 'context',
    }),
  ])
})

it('adds injectable class (scope: transient) in metadata args storage', () => {
  @Injectable('transient')
  class Service {}

  expect(getMetadataArgsStorage().injectables).toEqual([
    expect.objectContaining({
      target: Service,
      ref: Service,
      scope: 'transient',
    }),
  ])
})

it('adds injectable class with ref in metadata args storage', () => {
  const SERVICE_REF = Symbol()

  @Injectable(SERVICE_REF)
  class Service {}

  expect(getMetadataArgsStorage().injectables).toEqual([
    expect.objectContaining({
      target: Service,
      ref: SERVICE_REF,
      scope: 'singleton',
    }),
  ])
})

it('adds virtual injectable in metadata args storage', () => {
  const handle = () => '123'

  const ref = Symbol()

  Injectable.register(ref, 'singleton', handle)

  expect(getMetadataArgsStorage().injectables).toEqual([
    expect.objectContaining({
      ref,
      virtualizer: { handle, refs: [] },
      scope: 'singleton',
    }),
  ])
})
