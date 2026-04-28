import { SeasonalVariant } from './seasonalHooks'

export function getToolbarSx(variant: SeasonalVariant) {
  return (theme: any) => {
    if (variant === 'christmas') {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        background: 'linear-gradient(135deg, #0b6623 0%, #b30000 100%)',
        color: '#fff',
        backdropFilter: 'blur(8px)',
        maxHeight: 48,
        border: '1px solid',
        borderColor: 'rgba(255,255,255,0.12)',
        boxShadow: `0 6px 18px rgba(179,0,0,0.12), 0 1px 4px rgba(11,102,35,0.08)`,
      }
    }
    if (variant === 'january') {
      return {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        background: 'linear-gradient(180deg, #0960bdff 0%, #c9d9ea 100%)',
        color: '#333',
        maxHeight: 48,
        border: '0px solid',
        borderColor: 'rgba(0,0,0,0.06)',
        boxShadow: `0 6px 18px rgba(0,0,0,0.04)`,
      }
    }
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      background: 'linear-gradient(135deg, #0d0d14 0%, #1a1208 100%)',
      backdropFilter: 'blur(24px)',
      maxHeight: 40,
      border: '1px solid',
      borderColor: 'rgba(255,193,7,0.22)',
      boxShadow: `0 2px 8px rgba(255, 193, 7, 0.10), 0 1px 3px rgba(0,0,0,0.5)`,
    }
  }
}

export default getToolbarSx
