import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import type { FormazioneDataState } from './useFormazioneData'

interface AlertState {
  setAlertMessage: (msg: string) => void
  setAlertSeverity: (s: 'success' | 'error') => void
  setOpenAlert: (open: boolean) => void
}

export function useFormazionePrecedente(
  data: Pick<FormazioneDataState, 'message' | 'formazioneList'>,
  alert: AlertState,
) {
  const confirmPrecedenteMutation = useMutation(
    orpc.formazione.confirmPrecedente.mutationOptions(),
  )

  const formazioneGiaRilasciata =
    data.message ===
      'Formazione non rilasciabile, vuoi confermare la precedente formazione?' &&
    !data.formazioneList.isLoading &&
    !!data.formazioneList.data?.giocatori.some((g) => g.titolare)

  const canConfirmPrecedente =
    data.message ===
      'Formazione non rilasciabile, vuoi confermare la precedente formazione?' &&
    !data.formazioneList.isLoading &&
    !data.formazioneList.data?.giocatori.some((g) => g.titolare)

  const confirmingPrecedente = confirmPrecedenteMutation.isPending

  const handleConfirmPrecedente = async () => {
    try {
      await confirmPrecedenteMutation.mutateAsync(undefined)
      await data.formazioneList.refetch()
      alert.setAlertMessage('Formazione precedente confermata con successo')
      alert.setAlertSeverity('success')
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : 'Errore durante la conferma della formazione'
      alert.setAlertMessage(msg)
      alert.setAlertSeverity('error')
    }
    alert.setOpenAlert(true)
  }

  return {
    formazioneGiaRilasciata,
    canConfirmPrecedente,
    confirmingPrecedente,
    handleConfirmPrecedente,
  }
}
