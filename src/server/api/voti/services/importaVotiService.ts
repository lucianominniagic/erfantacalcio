/**
 * importaVotiService — modulo deep per il caricamento voti di una giornata.
 *
 * Interfaccia: importaVotiGiornata({ idCalendario, fileName, fileData })
 *
 * Il modulo orchestra internamente:
 *  1. Upload CSV su Vercel Blob
 *  2. Reset voti esistenti per la giornata
 *  3. Parsing del CSV FantaGazzetta
 *  4. Upsert voti in chunk (giocatori + auto-trasferimento + bonus/malus)
 *  5. Refresh stored procedure statistiche per ogni ruolo (P/D/C/A)
 *
 * Emette eventi di progresso via AsyncGenerator per feedback SSE al client.
 */

import { parse } from 'csv-parse'
import { Configurazione } from '~/config'
import { AppDataSource } from '~/data-source'
import { Voti } from '~/server/db/entities'
import { caricaVoti } from '~/server/services/caricaVotiService'
import { uploadFile } from '~/utils/blobVercelUtils'
import { normalizeNomeGiocatore } from '~/utils/helper'
import { formatToDecimalValue } from '~/utils/numberUtils'
import type { iVotoGiocatore } from '~/types/voti'

// ─── Tipi evento ────────────────────────────────────────────────────────────

export type ImportaVotiEvent =
  | { step: 'upload'; progress: number }
  | { step: 'reset'; progress: number }
  | { step: 'read'; progress: number }
  | { step: 'process'; progress: number }
  | { step: 'stats'; ruolo: string; progress: number }
  | { step: 'done'; progress: number; fileUrl: string }

// ─── Costanti ────────────────────────────────────────────────────────────────

const CHUNK_SIZE = 10
const RUOLI = ['P', 'D', 'C', 'A'] as const

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
            Voto: formatToDecimalValue(line[`Col${Configurazione.pfColumnVoto}`] ?? '0'),
            GolSegnati: formatToDecimalValue(line[`Col${Configurazione.pfColumnGolFatti}`] ?? '0'),
            GolSubiti: formatToDecimalValue(line[`Col${Configurazione.pfColumnGolSubiti}`] ?? '0'),
            Assist: formatToDecimalValue(line[`Col${Configurazione.pfColumnAssist}`] ?? '0'),
            Ammonizione: formatToDecimalValue(line[`Col${Configurazione.pfColumnAmmo}`] ?? '0'),
            Espulsione: formatToDecimalValue(line[`Col${Configurazione.pfColumnEspu}`] ?? '0'),
            Autogol: formatToDecimalValue(line[`Col${Configurazione.pfColumnAutogol}`] ?? '0'),
            RigoriErrati: formatToDecimalValue(
              line[`Col${Configurazione.pfColumnRigErrato}`] ?? '0',
            ),
            RigoriParati: formatToDecimalValue(
              line[`Col${Configurazione.pfColumnRigParato}`] ?? '0',
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

async function refreshStatsRuolo(ruolo: string): Promise<void> {
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
}

// ─── Interfaccia pubblica ────────────────────────────────────────────────────

export async function* importaVotiGiornata(input: {
  idCalendario: number
  fileName: string
  fileData: string
}): AsyncGenerator<ImportaVotiEvent> {
  // 1. Upload CSV su Vercel Blob
  const blob = await uploadFile(input.fileData, input.fileName, 'voti')
  console.info(`File voti caricato: ${blob.url}`)
  yield { step: 'upload', progress: 5 }

  // 2. Reset voti esistenti per la giornata
  await resetVotiGiornata(input.idCalendario)
  yield { step: 'reset', progress: 10 }

  // 3. Parsing CSV
  const voti = await parseVotiCsv(blob.url)
  console.info(`Voti letti dal CSV: ${voti.length}`)
  yield { step: 'read', progress: 15 }

  // 4. Upsert voti in chunk
  for (let i = 0; i < voti.length; i += CHUNK_SIZE) {
    const chunk = voti.slice(i, i + CHUNK_SIZE)
    await caricaVoti(chunk, input.idCalendario)
    const progress = 15 + Math.round(((i + chunk.length) / voti.length) * 70)
    yield { step: 'process', progress }
  }

  // 5. Refresh statistiche per ruolo
  for (let i = 0; i < RUOLI.length; i++) {
    await refreshStatsRuolo(RUOLI[i])
    yield { step: 'stats', ruolo: RUOLI[i], progress: 85 + (i + 1) * 3 }
  }

  yield { step: 'done', progress: 100, fileUrl: blob.url }
}
