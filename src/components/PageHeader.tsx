import { Box, Typography, useTheme } from '@mui/material'
import { alpha, darken } from '@mui/material/styles'
import type { SvgIconComponent } from '@mui/icons-material'

interface PageHeaderProps {
  title: string
  subtitle?: string
  Icon?: SvgIconComponent
}

export default function PageHeader({ title, subtitle, Icon }: PageHeaderProps) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const textColor = isDark ? theme.palette.primary.light : theme.palette.common.white
  const subtitleColor = alpha(textColor, isDark ? 0.75 : 0.85)
  const background = isDark
    ? `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.65)} 0%, ${darken(theme.palette.primary.main, 0.4)} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`

  return (
    <Box
      sx={{
        background,
        borderRadius: 2,
        px: 2.5,
        py: 1.5,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      {Icon && (
        <Icon sx={{ color: textColor, fontSize: '1.4rem' }} />
      )}
      <Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, color: textColor, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: subtitleColor, mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
