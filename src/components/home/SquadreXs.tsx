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
} from '@mui/material'

export default function SquadreXs() {
  const squadreList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return (
    <>
      {squadreList.isLoading ? (
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
      ) : (
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
            {squadreList.data?.map((squadra, index) => (
              <Grid item xs={3} key={index}>
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
                        onClick={() =>
                          (window.location.href = `/squadra/${squadra.id}/${squadra.squadra}`)
                        }
                      />
                    </Box>
                    <CardContent
                      sx={{ paddingBottom: '1px', paddingLeft: '3px' }}
                    >
                      <Typography variant="body2">{squadra.squadra}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </>
  )
}
