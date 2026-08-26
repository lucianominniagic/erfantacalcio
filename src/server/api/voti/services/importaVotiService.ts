/**
 * importaVotiService — modulo deep per il caricamento voti di una giornata.
 *
 * Su Vercel (piano base) una singola invocazione serverless che esegue upload,
 * reset, parsing, upsert di TUTTI i voti e refresh statistiche va facilmente in
 * timeout. Per questo il flusso è stato spezzato in step indipendenti,
 * richiamabili singolarmente dal client in un loop (vedi useUploadVotiAdmin):
 *
 *  1. initImportaVoti      — upload CSV su Blob + reset voti + parsing CSV
 *  2. processVotiChunk     — upsert di UN chunk di voti (giocatori + auto-trasferimento + bonus/malus)
 *  3. refreshStatsRuolo    — refresh stored procedure statistiche per UN ruolo (P/D/C/A)
 *
 * Ogni step è pensato per completarsi ben entro i limiti di durata di una
 * function serverless; è compito del chiamante iterare finché tutti i voti
 * sono stati processati e tutti i ruoli aggiornati.
 */

import { parse } from 'csv-parse'
import { Configurazione } from '~/config'
import { AppDataSource } from '~/data-source'
import { Voti } from '~/server/db/entities'
import { caricaVoti } from '~/server/services/caricaVotiService'
import { uploadFile } from '~/utils/blobVercelUtils'
import { normalizeNomeGiocatore } from '~/utils/giocatori'
import { formatToDecimalValue } from '~/utils/numberUtils'
import { IMPORTA_VOTI_CHUNK_SIZE, IMPORTA_VOTI_RUOLI, type iVotoGiocatore } from '~/types/voti'

// ─── Costanti ────────────────────────────────────────────────────────────────
// Riesportate per compatibilità con eventuali import esistenti dal service.
export const CHUNK_SIZE = IMPORTA_VOTI_CHUNK_SIZE
export const RUOLI = IMPORTA_VOTI_RUOLI

// ─── Helpers interni ─────────────────────────────────────────────────────────

async function parseVotiCsv(fileUrl: string): Promise<iVotoGiocatore[]> {
  const voti: iVotoGiocatore[] = []
  const headers: string[] = []
  for (let i = 1; i <= Configurazione.pfColumns; i++) {
    headers.push(`Col${i}`)
  }

  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Impossibile leggere il file voti: ${response.statusText}`)
  }
  const fileContent = await response.text()

  // formatToDecimalValue restituisce NaN per token non numerici (es. "sv" =
  // "senza voto"). calcBonusVoto sanitizza già NaN → 0 a valle, ma lo schema
  // Zod di output/input delle procedure oRPC richiede number validi: si
  // normalizza qui, così il dato che attraversa la validazione è sempre
  // coerente con quello effettivamente salvato.
  const orZero = (value: number): number => (isNaN(value) ? 0 : value)

  return new Promise((resolve, reject) => {
    parse(
      fileContent,
      {
        delimiter: '\t',
        columns: headers,
        on_record: (line: Record<string, string>) => {
          if (isNaN(parseFloat(line[`Col${Configurazione.pfColumnIdGiocatore}`] ?? '0'))) {
            return
          }
          voti.push({
            id_pf: line[`Col${Configurazione.pfColumnIdGiocatore}`]
              ? parseInt(line[`Col${Configurazione.pfColumnIdGiocatore}`] ?? '0')
              : null,
            Nome: normalizeNomeGiocatore(line[`Col${Configurazione.pfColumnNome}`] ?? ''),
            Ruolo: normalizeNomeGiocatore(line[`Col${Configurazione.pfColumnRuolo}`] ?? ''),
            Squadra: line[`Col${Configurazione.pfColumnSquadra}`] ?? '',
            Voto: orZero(formatToDecimalValue(line[`Col${Configurazione.pfColumnVoto}`] ?? '0')),
            GolSegnati: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnGolFatti}`] ?? '0'),
            ),
            GolSubiti: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnGolSubiti}`] ?? '0'),
            ),
            Assist: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnAssist}`] ?? '0'),
            ),
            Ammonizione: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnAmmo}`] ?? '0'),
            ),
            Espulsione: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnEspu}`] ?? '0'),
            ),
            Autogol: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnAutogol}`] ?? '0'),
            ),
            RigoriErrati: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnRigErrato}`] ?? '0'),
            ),
            RigoriParati: orZero(
              formatToDecimalValue(line[`Col${Configurazione.pfColumnRigParato}`] ?? '0'),
            ),
          })
        },
      },
      (error) => {
        if (error) reject(error)
        else resolve(voti)
      },
    )
  })
}

async function resetVotiGiornata(idCalendario: number): Promise<void> {
  await Voti.update(
    { idCalendario },
    { voto: 0, ammonizione: 0, espulsione: 0, gol: 0, assist: 0, autogol: 0, altriBonus: 0 },
  )
}

// ─── Interfaccia pubblica ────────────────────────────────────────────────────
// Ogni funzione qui sotto corrisponde a UNA sola invocazione serverless
// richiamabile dal client. Nessuna di esse deve iterare sull'intero set di
// voti/ruoli: la responsabilità di ripetere la chiamata fino al completamento
// è del chiamante (vedi useUploadVotiAdmin.ts).

/**
 * Step 1/3 — upload CSV su Blob + reset voti esistenti + parsing.
 * Operazione unica e rapida (nessun upsert massivo), eseguita in una sola
 * invocazione. Restituisce l'elenco completo dei voti letti dal CSV: sarà il
 * chiamante a suddividerli in chunk per lo step successivo.
 */
export async function initImportaVoti(input: {
  idCalendario: number
  fileName: string
  fileData: string
}): Promise<{ fileUrl: string; voti: iVotoGiocatore[] }> {
  const blob = await uploadFile(input.fileData, input.fileName, 'voti')
  console.info(`File voti caricato: ${blob.url}`)

  await resetVotiGiornata(input.idCalendario)

  const voti = await parseVotiCsv(blob.url)
  console.info(`Voti letti dal CSV: ${voti.length}`)

  return { fileUrl: blob.url, voti }
}

/**
 * Step 2/3 — upsert di UN singolo chunk di voti (giocatori + auto-trasferimento
 * + bonus/malus). Il chiamante deve invocarla ripetutamente, un chunk alla
 * volta, finché tutti i voti non sono stati processati.
 */
export async function processVotiChunk(
  voti: iVotoGiocatore[],
  idCalendario: number,
): Promise<{ processed: number }> {
  await caricaVoti(voti, idCalendario)
  return { processed: voti.length }
}

/**
 * Step 3/3 — refresh della stored procedure statistiche per UN singolo ruolo
 * (P/D/C/A). Il chiamante deve invocarla una volta per ciascun ruolo.
 */
export async function refreshStatsRuolo(ruolo: string): Promise<{ ruolo: string }> {
  console.info(`sp_RefreshStats_${ruolo} per stagione ${Configurazione.stagione}`)
  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  try {
    await queryRunner.query(`
      DO $$
      BEGIN
        PERFORM public.sp_RefreshStats_${ruolo}('${ruolo}', '${Configurazione.stagione}');
      END $$;
    `)
  } finally {
    await queryRunner.release()
  }
  return { ruolo }
}
