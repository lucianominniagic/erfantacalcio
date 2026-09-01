/**
 * Nomi file (senza estensione) delle maglie che, per via dei colori scuri/neri
 * predominanti, risultano poco visibili su sfondi scuri e necessitano quindi
 * di uno sfondo bianco quando vengono mostrate.
 */
const MAGLIE_SU_SFONDO_BIANCO = ['juventus']

/**
 * Determina se il contenitore dell'immagine della maglia deve avere uno
 * sfondo bianco, per garantire la visibilità di loghi con colori scuri
 * (es. juventus.png) su sfondi scuri.
 */
export function magliaRichiedeSfondoBianco(maglia?: string | null): boolean {
  if (!maglia) return false
  const nomeFile = maglia.split('/').pop() ?? maglia
  const nomeSenzaEstensione = nomeFile.replace(/\.[^./]+$/, '').toLowerCase()
  return MAGLIE_SU_SFONDO_BIANCO.includes(nomeSenzaEstensione)
}
