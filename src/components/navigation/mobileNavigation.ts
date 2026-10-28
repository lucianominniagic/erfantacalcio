export type MobileHomeSection =
  | 'formazione'
  | 'calendario'
  | 'classifica'
  | 'squadre'

export type MobileNavigationValue =
  | MobileHomeSection
  | 'mercato'
  | 'giocatori'
  | 'economia'
  | null

export type MobileNavigationActionValue = Exclude<
  MobileNavigationValue,
  null
>

export interface MobileNavigationIntent {
  homeSection: MobileHomeSection | null
  href: string | null
}

const pageRoutes: Partial<Record<MobileNavigationActionValue, string>> = {
  mercato: '/mercato',
  giocatori: '/statistiche_giocatori',
  economia: '/economia',
}

export function getMobileNavigationIntent(
  value: MobileNavigationActionValue,
  pathname: string,
): MobileNavigationIntent {
  const pageRoute = pageRoutes[value]
  if (pageRoute) {
    return { homeSection: null, href: pageRoute }
  }

  if (value === 'formazione') {
    return {
      homeSection: value,
      href: pathname === '/' ? null : '/formazione',
    }
  }

  switch (value) {
    case 'calendario':
    case 'classifica':
    case 'squadre':
      return {
        homeSection: value,
        href: pathname === '/' ? null : '/',
      }
    default:
      return { homeSection: null, href: null }
  }
}
