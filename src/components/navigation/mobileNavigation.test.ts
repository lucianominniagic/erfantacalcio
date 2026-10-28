import { describe, expect, it } from 'vitest'
import { getMobileNavigationIntent } from './mobileNavigation'

describe('getMobileNavigationIntent', () => {
  it('preserves the selected home section when returning from another route', () => {
    expect(getMobileNavigationIntent('squadre', '/mercato')).toEqual({
      homeSection: 'squadre',
      href: '/',
    })
  })

  it('updates the selected section without navigating on the home page', () => {
    expect(getMobileNavigationIntent('squadre', '/')).toEqual({
      homeSection: 'squadre',
      href: null,
    })
  })
})
