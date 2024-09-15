import HttpTesting from '../../http-testing.js'
import { expect, it } from 'vitest'
import { Header } from '../Header.js'
import BluishCoreTesting from '@bluish/core/testing'
import { toHttpContext } from '../../../.test/toHttpContext.js'

it('catch header in http context', async () => {
  const value = await BluishCoreTesting.runSelector(
    Header('Authorization'),
    toHttpContext({
      headers: { Authorization: 'Bearer 12345678' },
    }),
  )

  expect(value).toBe('Bearer 12345678')
})

it('catch header in http context', async () => {
  const value = await BluishCoreTesting.runSelector(
    Header('X-Example'),
    HttpTesting.toContext({
      headers: { 'X-Example': '987' },
    }),
  )

  expect(value).toBe('987')
})
