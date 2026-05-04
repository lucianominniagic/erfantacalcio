import React from 'react'
import { api } from '~/utils/api'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Link from 'next/link'

export default function Squadre() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const squadreList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (squadreList.isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress color="warning" />
      </Box>
    )
  }

  if (isXs) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <Grid container spacing={0}>
          {squadreList.data?.map((squadra) => (
            <Grid item xs={3} key={squadra.id}>
              <Link
                href={`/squadra/${squadra.id}/${squadra.squadra}`}
                style={{ textDecoration: 'none' }}
              >
                <Card
                  sx={{
                    minWidth: 84,
                    maxWidth: 84,
                    marginBottom: '4px',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      borderColor: 'rgba(255,193,7,0.5)',
                    },
                  }}
                >
                  <CardActionArea>
                    <Box sx={{ overflow: 'hidden', height: 68 }}>
                      <CardMedia
                        component="img"
                        height="68"
                        image={squadra.foto ?? ''}
                        alt={squadra.squadra}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          '.MuiCardActionArea-root:hover &': {
                            transform: 'scale(1.12)',
                          },
                        }}
                      />
                    </Box>
                    <CardContent sx={{ paddingBottom: '1px', paddingLeft: '3px' }}>
                      <Typography variant="body2"><h5>{squadra.squadra}</h5></Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        py: 1,
      }}
    >
      {squadreList.data?.map((squadra) => (
        <Link
          key={squadra.id}
          href={`/squadra/${squadra.id}/${squadra.squadra}`}
          style={{ textDecoration: 'none' }}
        >
          <Card
            sx={{
              minWidth: 110,
              maxWidth: 110,
              marginBottom: '0px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'rgba(255,193,7,0.5)',
                boxShadow: '0 6px 20px rgba(255,193,7,0.15)',
              },
            }}
          >
            <CardActionArea>
              <Box sx={{ overflow: 'hidden', height: 80 }}>
                <CardMedia
                  component="img"
                  height="80"
                  image={squadra.foto ?? ''}
                  alt={squadra.squadra}
                  sx={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '.MuiCardActionArea-root:hover &': {
                      transform: 'scale(1.12)',
                    },
                  }}
                />
              </Box>
              <CardContent sx={{ p: '6px 8px', '&:last-child': { pb: '6px' } }}>
                <Typography
                  variant="h5"
                  sx={{ fontSize: '0.7rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                  {squadra.squadra}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Link>
      ))}
    </Box>
  )
}
