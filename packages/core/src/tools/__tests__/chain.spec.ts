import { expect, it, vi } from 'vitest'
import { chain } from '../chain.js'

it('call chain fn', () => {
  const chain1 = vi.fn()

  chain([chain1])(null)

  expect(chain1).toHaveBeenCalledTimes(1)
})

it('call chain fns', () => {
  const chain1 = vi.fn(next => next())
  const chain2 = vi.fn()

  chain([chain1, chain2])(null)

  expect(chain1).toHaveBeenCalledTimes(1)
  expect(chain2).toHaveBeenCalledTimes(1)
})

it('chain return next pivo value', async () => {
  await expect(chain([])(async () => 'Joe')).resolves.toEqual('Joe')
})

it('chain return next pivo value', async () => {
  await expect(chain([])(async () => 'Joe')).resolves.toEqual('Joe')
})

it('chain return with last value', async () => {
  const chain1 = vi.fn(async next => next())
  const chain2 = vi.fn(async next => next())

  await expect(chain([chain1, chain2])(async () => 'Joe')).resolves.toEqual(
    'Joe',
  )
})

it('chain return with last value', async () => {
  const chain1 = vi.fn(async next => next())
  const chain2 = vi.fn(() => 2)

  await expect(chain([chain1, chain2])(null)).resolves.toEqual(2)
})
