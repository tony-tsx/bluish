import CoreTesting from '@bluish/core/testing'
import HttpTesting from '../../http-testing.js'
import { expect, it } from 'vitest'
import { UseHeader } from '../UseHeader.js'

it('catch header in http context', async () => {
  const value = await CoreTesting.runSelector(
    UseHeader('Authorization'),
    HttpTesting.toContext({
      headers: { Authorization: 'Bearer 12345678' },
    }),
  )

  expect(value).toBe('Bearer 12345678')
})

it('catch header in http context', async () => {
  const value = await CoreTesting.runSelector(
    UseHeader('X-Example'),
    HttpTesting.toContext({
      headers: { 'X-Example': '987' },
    }),
  )

  expect(value).toBe('987')
})
