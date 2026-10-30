import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import EsitoAggiudicazione, {
  type EsitoAggiudicazioneData,
} from '~/components/mercato/shared/EsitoAggiudicazione'

const data: EsitoAggiudicazioneData = {
  acquistiEffettivi: 2,
  tipoValuta: 'euro',
  giocatori: [
    {
      idGiocatore: 1,
      nomeGiocatore: 'GIOCATORE A.',
      vincitore: {
        idSquadra: 1,
        presidente: 'Presidente',
        prezzo: 0,
        priorita: 1,
      },
      offerte: [
        {
          idProposta: 1,
          presidente: 'Presidente',
          prezzoOfferto: 0,
          priorita: 1,
          esito: 'VINTA',
          motivo: 'aggiudicata',
        },
      ],
    },
    {
      idGiocatore: 2,
      nomeGiocatore: 'GIOCATORE B.',
      vincitore: null,
      offerte: [
        {
          idProposta: 2,
          presidente: 'Altro',
          prezzoOfferto: 5.5,
          priorita: 3,
          esito: 'PERSA',
          motivo: 'rilasciata_per_cap',
        },
        {
          idProposta: 3,
          presidente: 'Terzo',
          prezzoOfferto: 1,
          priorita: 4,
          esito: 'PERSA',
          motivo: 'superata_prezzo',
        },
      ],
    },
  ],
  dettaglio: [
    {
      idProposta: 1,
      presidente: 'Presidente',
      nomeGiocatore: 'GIOCATORE A.',
      priorita: 1,
      prezzoOfferto: 0,
      esito: 'VINTA',
      motivo: 'aggiudicata',
    },
    {
      idProposta: 2,
      presidente: 'Altro',
      nomeGiocatore: 'GIOCATORE B.',
      priorita: 3,
      prezzoOfferto: 5.5,
      esito: 'PERSA',
      motivo: 'rilasciata_per_cap',
    },
    {
      idProposta: 3,
      presidente: 'Terzo',
      nomeGiocatore: 'GIOCATORE B.',
      priorita: 4,
      prezzoOfferto: 1,
      esito: 'PERSA',
      motivo: 'superata_prezzo',
    },
  ],
}

describe('EsitoAggiudicazione', () => {
  it('renders mobile cards alongside the desktop tables without dropping offer outcomes', () => {
    const html = renderToStaticMarkup(
      createElement(EsitoAggiudicazione, { data }),
    )
    expect(html.match(/<article /g)).toHaveLength(2)
    expect(html.match(/<table /g)).toHaveLength(2)
    expect(html).toContain('Mostra 1')
    expect(html).toContain('Mostra 2')
    expect(html).toContain('Aggiudicato a')
    expect(html).toContain('Resta svincolato')
    expect(html).toContain('PERSA · cap raggiunto')
    expect(html).toContain('PERSA · superata')
    expect(html).toContain('VINTA')
    expect(html).toContain('Priorità')
    expect(html).toContain('Dettaglio per proposta')
    const text = html
      .replace(/<style[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]*>/g, '')
    expect(text).toContain('2Giocatori')
    expect(text).toContain('1Assegnati')
    expect(text).toContain('0 €Spesa totale')
    expect(text).toContain('PresidentePriorità 10 €')
  })

  it('uses the session currency and configured purchase cap', () => {
    const html = renderToStaticMarkup(
      createElement(EsitoAggiudicazione, {
        data: { ...data, tipoValuta: 'fantamilioni', acquistiEffettivi: 1 },
      }),
    )
    expect(html).toContain('FM')
    expect(html).not.toContain('€')
    expect(html).toContain('al massimo 1 acquisto.')
    expect(html).toContain('5,5')
  })

  it('renders an explicit empty state', () => {
    const html = renderToStaticMarkup(
      createElement(EsitoAggiudicazione, {
        data: { ...data, giocatori: [], dettaglio: [] },
      }),
    )
    expect(html).toContain('Nessuna offerta ricevuta.')
    expect(html).toContain('Nessuna proposta da mostrare.')
    expect(html).not.toContain('<article ')
  })
})
