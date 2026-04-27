import { SeasonalVariant } from './seasonalHooks'

export function getToolbarPresentation(variant: SeasonalVariant) {
  if (variant === 'christmas') {
    return { titleColor: '#fff', iconColor: '#fff' }
  }
  if (variant === 'january') {
    // January should use higher-contrast title and darker Sign in button
    return {
      titleColor: '#111',
      iconColor: undefined,
      buttonSx: { backgroundColor: '#2f3a44', color: '#ffffff' },
    }
  }
  return { titleColor: '#f5f5f5', iconColor: undefined }
}

export default getToolbarPresentation
