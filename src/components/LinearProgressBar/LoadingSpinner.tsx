import { Box, CircularProgress, type CircularProgressProps } from '@mui/material'

interface LoadingSpinnerProps {
  color?: CircularProgressProps['color']
}

export default function LoadingSpinner({ color = 'warning' }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress color={color} />
    </Box>
  )
}
