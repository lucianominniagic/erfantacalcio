import * as React from 'react'
import GenericCard, { type GenericCardProps } from './GenericCard'
import { Alert, Stack } from '@mui/material'

export interface CardWithActionsProps extends Omit<
  GenericCardProps,
  'actions' | 'children'
> {
  /** Main content of the card */
  children: React.ReactNode
  /** Action buttons */
  actions?: React.ReactNode
  /** Success message to display */
  successMessage?: string
  /** Error message to display */
  errorMessage?: string
  /** Loading state */
  loading?: boolean
  /** onSubmit handler if used as a form container */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
  /** Whether to render as a form */
  asForm?: boolean
  /** Direction of actions (row or column) */
  actionsDirection?: 'row' | 'column'
  /** Justify actions */
  actionsJustify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
  /** Spacing between actions */
  actionsSpacing?: number
}

/**
 * Card component with built-in support for actions, messages, and form handling.
 * Extends GenericCard with additional functionality for interactive cards.
 *
 * @example Card with form
 * ```tsx
 * <CardWithActions
 *   title="Edit User"
 *   asForm
 *   onSubmit={handleSubmit}
 *   successMessage={success}
 *   errorMessage={error}
 *   actions={
 *     <>
 *       <Button type="button" onClick={handleCancel}>Cancel</Button>
 *       <Button type="submit" variant="contained">Save</Button>
 *     </>
 *   }
 * >
 *   <TextField label="Name" />
 *   <TextField label="Email" />
 * </CardWithActions>
 * ```
 *
 * @example Card with actions and messages
 * ```tsx
 * <CardWithActions
 *   title="Confirm Action"
 *   successMessage="Action completed!"
 *   actions={
 *     <>
 *       <Button onClick={handleNo}>No</Button>
 *       <Button variant="contained" onClick={handleYes}>Yes</Button>
 *     </>
 *   }
 * >
 *   <Typography>Are you sure you want to proceed?</Typography>
 * </CardWithActions>
 * ```
 */
export default function CardWithActions({
  children,
  actions,
  successMessage,
  errorMessage,
  loading,
  onSubmit,
  asForm = false,
  actionsDirection = 'row',
  actionsJustify = 'flex-end',
  actionsSpacing = 1,
  showActionsDivider = true,
  ...cardProps
}: CardWithActionsProps) {
  const content = (
    <>
      {/* Messages */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {/* Content */}
      {children}
    </>
  )

  const actionsContent = actions ? (
    <Stack
      direction={actionsDirection}
      spacing={actionsSpacing}
      justifyContent={actionsJustify}
      sx={{ width: '100%' }}
    >
      {actions}
    </Stack>
  ) : undefined

  // Render as form
  if (asForm && onSubmit) {
    return (
      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <GenericCard
          {...cardProps}
          actions={actionsContent}
          showActionsDivider={showActionsDivider}
        >
          {content}
        </GenericCard>
      </form>
    )
  }

  // Render as regular card
  return (
    <GenericCard
      {...cardProps}
      actions={actionsContent}
      showActionsDivider={showActionsDivider}
    >
      {content}
    </GenericCard>
  )
}
