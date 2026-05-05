import * as React from 'react'
import {
  Card as MuiCard,
  CardHeader as MuiCardHeader,
  CardContent as MuiCardContent,
  CardActions as MuiCardActions,
  Paper,
  Divider,
  type SxProps,
  type Theme,
  Avatar,
  IconButton,
  type CardProps as MuiCardProps,
} from '@mui/material'

export interface GenericCardProps {
  /** Card title */
  title?: React.ReactNode
  /** Card subtitle */
  subtitle?: React.ReactNode
  /** Avatar image URL or icon */
  avatar?: React.ReactNode
  /** Action buttons in the header */
  headerAction?: React.ReactNode
  /** Main content of the card */
  children: React.ReactNode
  /** Footer actions (buttons, etc.) */
  actions?: React.ReactNode
  /** Maximum width */
  maxWidth?: string | number
  /** Card elevation */
  elevation?: number
  /** Whether to wrap in Paper */
  withPaper?: boolean
  /** Custom styles for the card */
  sx?: SxProps<Theme>
  /** Custom styles for the content */
  contentSx?: SxProps<Theme>
  /** Custom styles for the header */
  headerSx?: SxProps<Theme>
  /** Custom styles for the actions */
  actionsSx?: SxProps<Theme>
  /** Show divider after header */
  showHeaderDivider?: boolean
  /** Show divider before actions */
  showActionsDivider?: boolean
  /** Title typography variant */
  titleVariant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
  /** Subtitle typography variant */
  subtitleVariant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'subtitle1'
    | 'subtitle2'
    | 'body1'
    | 'body2'
  /** Content padding */
  contentPadding?: number | string
  /** onClick handler for the entire card */
  onClick?: () => void
  /** Whether the card is clickable (adds hover effect) */
  clickable?: boolean
  /** Additional Card props */
  cardProps?: Partial<MuiCardProps>
}

/**
 * Generic Card component with configurable header, content, and actions.
 * Built on top of Material-UI Card components.
 *
 * @example Basic card
 * ```tsx
 * <GenericCard title="My Card" subtitle="Card subtitle">
 *   <Typography>Card content here</Typography>
 * </GenericCard>
 * ```
 *
 * @example Card with avatar and actions
 * ```tsx
 * <GenericCard
 *   title="User Profile"
 *   subtitle="Active user"
 *   avatar={<Avatar src="/avatar.jpg" />}
 *   actions={
 *     <>
 *       <Button>Edit</Button>
 *       <Button color="error">Delete</Button>
 *     </>
 *   }
 * >
 *   <Typography>User details...</Typography>
 * </GenericCard>
 * ```
 *
 * @example Clickable card
 * ```tsx
 * <GenericCard
 *   title="Click me"
 *   clickable
 *   onClick={() => navigate('/details')}
 * >
 *   <Typography>This card is clickable</Typography>
 * </GenericCard>
 * ```
 */
export default function GenericCard({
  title,
  subtitle,
  avatar,
  headerAction,
  children,
  actions,
  maxWidth,
  elevation = 1,
  withPaper = false,
  sx,
  contentSx,
  headerSx,
  actionsSx,
  showHeaderDivider = false,
  showActionsDivider = false,
  titleVariant = 'h5',
  subtitleVariant = 'h6',
  contentPadding,
  onClick,
  clickable = false,
  cardProps,
}: GenericCardProps) {
  const cardContent = (
    <MuiCard
      elevation={elevation}
      onClick={onClick}
      sx={{
        maxWidth,
        ...(clickable && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
          },
        }),
        ...sx,
      }}
      {...cardProps}
    >
      {/* Header */}
      {(title || subtitle || avatar || headerAction) && (
        <>
          <MuiCardHeader
            avatar={avatar}
            action={headerAction}
            title={title}
            subheader={subtitle}
            titleTypographyProps={{ variant: titleVariant }}
            subheaderTypographyProps={{ variant: subtitleVariant }}
            sx={headerSx}
          />
          {showHeaderDivider && <Divider />}
        </>
      )}

      {/* Content */}
      <MuiCardContent
        sx={{
          ...(contentPadding !== undefined && { padding: contentPadding }),
          ...contentSx,
        }}
      >
        {children}
      </MuiCardContent>

      {/* Actions */}
      {actions && (
        <>
          {showActionsDivider && <Divider />}
          <MuiCardActions sx={actionsSx}>{actions}</MuiCardActions>
        </>
      )}
    </MuiCard>
  )

  // Wrap in Paper if requested
  if (withPaper) {
    return (
      <Paper elevation={0} sx={{ maxWidth }}>
        {cardContent}
      </Paper>
    )
  }

  return cardContent
}
