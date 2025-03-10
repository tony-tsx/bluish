import BluishHttpTesting from '../../modules/testing.js'
import { expect, it } from 'vitest'
import { Header } from '../Header.js'
import BluishCoreTesting from '@bluish/core/testing'

it('catch header in http context', async () => {
  const value = await BluishCoreTesting.runSelector(
    Header('Authorization'),
    BluishHttpTesting.toContext({
      headers: { Authorization: 'Bearer 12345678' },
    }),
  )

  expect(value).toBe('Bearer 12345678')
})

it('catch header in http context', async () => {
  const value = await BluishCoreTesting.runSelector(
    Header('X-Example'),
    BluishHttpTesting.toContext({
      headers: { 'X-Example': '987' },
    }),
  )

  expect(value).toBe('987')
})
