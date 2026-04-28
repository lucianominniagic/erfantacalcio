import React from 'react'
import { api } from '~/utils/api'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material'

export default function Squadre() {
  const squadreList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

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
      {!squadreList.isLoading &&
        squadreList.data?.map((squadra, index) => (
          <Card
            key={index}
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
              <CardMedia
                component="img"
                height="80"
                image={squadra.foto ?? ''}
                alt={squadra.squadra}
                sx={{ objectFit: 'cover' }}
                onClick={() =>
                  (window.location.href = `/squadra/${squadra.id}/${squadra.squadra}`)
                }
              />
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
        ))}
    </Box>
  )
}
