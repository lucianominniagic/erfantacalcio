'use client'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useMemo } from 'react'
import { api } from '~/utils/api'
import { useTheme } from '@mui/material/styles'
import { type GiocatoreType } from '~/types/squadre'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { useGiocatoreModal } from '../cardPartite/usePartitaParams'

type RosaProps = {
  idSquadra: number
}

const RUOLO_ORDER: Record<string, number> = { A: 0, C: 1, D: 2, P: 3 }

const RUOLO_COLOR: Record<string, 'error' | 'success' | 'info' | 'default'> = {
  A: 'error',
  C: 'success',
  D: 'info',
  P: 'default',
}

interface RosaListProps {
  giocatori: GiocatoreType[]
  onSelect: (id: number) => void
  dimmed?: boolean
  truncateSquad?: boolean
}

function RosaList({ giocatori, onSelect, dimmed = false, truncateSquad = false }: RosaListProps) {
  return (
    <Box>
      {giocatori.map((g, i) => (
        <Box
          key={g.idGiocatore}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 0.75,
            px: 0.5,
            borderBottom: i < giocatori.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
            opacity: dimmed ? 0.5 : 1,
          }}
        >
          <Avatar
            src={g.urlCampioncinoSmall}
            alt={g.nome}
            variant="square"
            sx={{ width: 28, height: 28, flexShrink: 0 }}
          />
          <Chip
            label={g.ruolo}
            size="small"
            color={RUOLO_COLOR[g.ruolo] ?? 'default'}
            sx={{ width: 36, flexShrink: 0, fontSize: '0.65rem', fontWeight: 700 }}
          />
          <Typography
            variant="body2"
            sx={{
              flex: 1,
              cursor: 'pointer',
              color: 'primary.main',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            onClick={() => onSelect(g.idGiocatore)}
          >
            {g.nome}
          </Typography>
          <Typography
            variant="caption"
            sx={{ flexShrink: 0, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            {truncateSquad
              ? (g.nomeSquadraSerieA ?? '').slice(0, 3)
              : (g.nomeSquadraSerieA ?? '')}
          </Typography>
          <Typography
            variant="caption"
            sx={{ flexShrink: 0, color: 'text.secondary' }}
          >
            {g.costo.toFixed(0)} M€
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

function Rosa({ idSquadra }: RosaProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const {
    idGiocatore: selectedGiocatoreId,
    openModalCalendario,
    handleStatGiocatore: handleGiocatoreSelected,
    handleModalClose,
  } = useGiocatoreModal()

  const rosaList = api.squadre.getRosa.useQuery(
    { idSquadra, includeVenduti: true },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  const { rosaAttiva, rosaVenduta } = useMemo(() => {
    if (!rosaList.data) return { rosaAttiva: [], rosaVenduta: [] }
    const attiva = rosaList.data
      .filter((g: GiocatoreType) => !g.isVenduto)
      .sort((a: GiocatoreType, b: GiocatoreType) =>
        (RUOLO_ORDER[b.ruolo] ?? 9) - (RUOLO_ORDER[a.ruolo] ?? 9) || b.costo - a.costo,
      )
    const venduta = rosaList.data
      .filter((g: GiocatoreType) => g.isVenduto)
      .sort((a: GiocatoreType, b: GiocatoreType) =>
        (RUOLO_ORDER[b.ruolo] ?? 9) - (RUOLO_ORDER[a.ruolo] ?? 9) || b.costo - a.costo,
      )
    return { rosaAttiva: attiva, rosaVenduta: venduta }
  }, [rosaList.data])



  return (
    <>
      <Box>
        <Typography variant="h4" sx={{ mb: 2 }}>Rosa</Typography>

        {rosaList.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <>
            <RosaList
              giocatori={rosaAttiva}
              onSelect={handleGiocatoreSelected}
              truncateSquad={isXs}
            />
            {rosaVenduta.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                  Giocatori ceduti
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <RosaList
                  giocatori={rosaVenduta}
                  onSelect={handleGiocatoreSelected}
                  dimmed
                  truncateSquad={isXs}
                />
              </Box>
            )}
          </>
        )}

        <Box sx={{ height: '100px' }} />
      </Box>

      <Modal
        title={'Statistica giocatore'}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={isXs ? '98%' : '1266px'}
        height={isXs ? '98%' : ''}
      >
        <Divider />
        <Box sx={{ mt: 1 }}>
          {selectedGiocatoreId !== undefined && (
            <Giocatore idGiocatore={selectedGiocatoreId} />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default Rosa
