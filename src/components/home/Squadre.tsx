'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from '@mui/material'
import { ChevronRight, Groups } from '@mui/icons-material'
import { orpc } from '~/utils/orpc'
import PageHeader from '~/components/PageHeader'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'

export default function Squadre() {
  const squadreList = useQuery(
    orpc.squadre.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const squadre = squadreList.data ?? []

  return (
    <Box sx={{ width: '100%', minWidth: 0, maxWidth: 1000, mx: 'auto', py: 1 }}>
      <PageHeader
        title="Squadre"
        subtitle="Le squadre della lega, i presidenti e le rose"
        Icon={Groups}
      />
      {squadreList.isLoading ? (
        <Box aria-busy="true" aria-label="Caricamento squadre">
          <LoadingSpinner />
        </Box>
      ) : squadreList.isError ? (
        <Alert severity="error">
          Impossibile caricare le squadre: {squadreList.error.message}
        </Alert>
      ) : squadre.length === 0 ? (
        <Alert severity="info">Nessuna squadra disponibile.</Alert>
      ) : (
        <Box
          component="ul"
          aria-label="Squadre della lega"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              sm: 'repeat(3, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: { xs: 1.25, sm: 2 },
            m: 0,
            p: 0,
            listStyle: 'none',
          }}
        >
          {squadre.map((team) => (
            <Card
              component="li"
              key={team.id}
              variant="outlined"
              sx={{ minWidth: 0 }}
            >
              <CardActionArea
                component={Link}
                href={`/squadra/${team.id}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    width: '100%',
                    boxSizing: 'border-box',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Avatar
                    src={team.foto ?? undefined}
                    alt=""
                    variant="rounded"
                    sx={{
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '4 / 3',
                      '& img': { objectFit: 'contain' },
                      bgcolor: 'background.default',
                      color: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {team.squadra.slice(0, 1)}
                  </Avatar>
                </Box>
                <CardContent
                  sx={{
                    width: '100%',
                    boxSizing: 'border-box',
                    p: 1.25,
                    '&:last-child': { pb: 1.25 },
                  }}
                >
                  <Typography
                    component="h3"
                    variant="body2"
                    fontWeight={800}
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {team.squadra}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {team.presidente}
                  </Typography>
                  <Typography
                    component="span"
                    variant="caption"
                    color="primary.main"
                    sx={{
                      mt: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.25,
                    }}
                  >
                    Rosa e dettagli <ChevronRight fontSize="small" />
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
