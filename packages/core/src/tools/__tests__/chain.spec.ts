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
