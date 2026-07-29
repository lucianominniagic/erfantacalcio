import {
  Box,
  Card,
  Chip,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { KeyboardArrowUp, MenuBook } from '@mui/icons-material'

// ── Content model ──────────────────────────────────────────────────────────
// Contenuto trascritto fedelmente da public/docs/Regolamento_erFantacalcio.docx

type Block =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }

interface SubSection {
  title: string
  blocks: Block[]
}

interface Section {
  id: string
  title: string
  blocks?: Block[]
  subsections?: SubSection[]
}

const sections: Section[] = [
  {
    id: 'calendario-stagionale',
    title: 'Calendario stagionale',
    blocks: [
      {
        type: 'p',
        text: 'Si saltano le prime 3 giornate di serie A, si comincia la nostra stagione dalla 4 giornata di serie A prevista per venerdì 11 settembre e termina la 38 giornata di serie A prevista per il 30 maggio 2027.',
      },
    ],
    subsections: [
      {
        title: 'Campionato',
        blocks: [
          {
            type: 'p',
            text: 'Il calendario prevede per il fantacampionato 5 gironi, ogni girone è composto da 7 giornate per un totale di 35 giornate.',
          },
        ],
      },
      {
        title: 'Champions',
        blocks: [
          { type: 'p', text: 'Per la Champions:' },
          {
            type: 'list',
            items: [
              'Girone A (passano le prime 2)',
              'Girone B (passano le prime 2)',
              'Semifinale di andata (senza gol che vale doppio e senza fattore casalingo)',
              'Semifinale di ritorno (senza gol che vale doppio e senza fattore casalingo)',
              'Finalissima unica senza fattore casalingo',
            ],
          },
          {
            type: 'p',
            text: 'Tutte le partite di Champions verranno giocate in contemporanea con una partita di fantacampionato. In caso di parità tra reti fatte e subite verrà assegnato come vincitore la squadra che ha realizzato il maggior numero di fantapunti nelle partite coinvolte.',
          },
          {
            type: 'p',
            text: 'I gironi della Champions si giocheranno nelle seguenti giornate di serie A: 7, 10, 13, 16, 19, 22.',
          },
          {
            type: 'p',
            text: 'Le fasi finali della Champions si giocheranno nelle seguenti giornate di serie A: 28, 32, 36.',
          },
          {
            type: 'p',
            text: 'Per le fasi finali della Champions in caso non venga consegnata la formazione viene prevista la multa ma la partita si giocherà regolarmente inserendo la formazione precedentemente rilasciata.',
          },
        ],
      },
      {
        title: 'Coppa dei perdenti',
        blocks: [
          {
            type: 'p',
            text: "Da quest'anno per aumentare l'interesse per il fantacalcio anche per le squadre inferiori si propone la Coppa dei Perdenti.",
          },
          { type: 'p', text: 'La Coppa prevede le seguenti partite:' },
          {
            type: 'list',
            items: [
              'Semifinale di andata (senza gol che vale doppio e senza fattore casalingo)',
              'Semifinale di ritorno (senza gol che vale doppio e senza fattore casalingo)',
              'Finalissima unica senza fattore casalingo',
            ],
          },
          {
            type: 'p',
            text: 'Gli accoppiamenti saranno definiti alla fine della 32ª giornata di fanta-campionato.',
          },
          {
            type: 'p',
            text: 'Si scontreranno in semifinale andata e ritorno la 5ª vs 8ª e la 6ª vs 7ª.',
          },
          {
            type: 'p',
            text: 'Le vincenti si affronteranno in finale secca senza fattore casalingo.',
          },
          {
            type: 'p',
            text: "Che premi prevede la Coppa dei perdenti? L'abbassamento della quota annuale del fantacalcio.",
          },
          {
            type: 'p',
            text: 'A fronte di una quota annuale di 120€ la ripartizione verrà così modificata:',
          },
          {
            type: 'table',
            headers: ['Fase', 'Vincente', 'Perdente'],
            rows: [
              ['Semifinali', '90€', '150€'],
              ['Finale', '70€', '110€'],
            ],
          },
          {
            type: 'p',
            text: 'Le spese di mercato e le multe non vengono conteggiate nella suddivisione suddetta.',
          },
          {
            type: 'p',
            text: 'Per la coppa dei perdenti in caso non venga consegnata la formazione viene prevista la multa ma la partita si giocherà regolarmente inserendo la formazione precedentemente rilasciata.',
          },
        ],
      },
    ],
  },
  {
    id: 'rose',
    title: 'Rose',
    blocks: [
      {
        type: 'p',
        text: 'Il numero dei giocatori per ciascuna rosa è fisso: 3 Portieri, 8 Difensori, 8 centrocampisti, 6 attaccanti.',
      },
      {
        type: 'p',
        text: "In caso di infortunio o morte di un giocatore, questo non potrà essere sostituito fino alla prossima sessione di mercato. Nel caso non sia prevista un'ulteriore sessione di mercato la squadra rimarrà con un giocatore in meno.",
      },
    ],
  },
  {
    id: 'acquisto-portieri',
    title: 'Acquisto portieri',
    blocks: [
      {
        type: 'p',
        text: 'I portieri sono trattati come qualsiasi altro ruolo. Quindi non va più dichiarato se un portiere è primario o secondario. Il presidente dovrà acquistare 3 portieri e avrà a disposizione solo quei 3 in rosa.',
      },
    ],
  },
  {
    id: 'schieramento-formazione',
    title: 'Schieramento formazione',
    blocks: [
      { type: 'p', text: 'La formazione va schierata secondo quanto segue:' },
      {
        type: 'list',
        items: [
          '11 titolari',
          'Tutti i giocatori rimanenti vanno schierati in panchina',
        ],
      },
    ],
  },
  {
    id: 'voti',
    title: 'Voti',
    blocks: [
      {
        type: 'p',
        text: "I voti verranno presi dal sito PianetaFantacalcio.it; sul sito vengono riportati tutti i voti di tutte le principali testate giornalistiche sportive: Corriere dello sport e Gazzetta. Il conteggio di ciascun giocatore verrà fatto usando la media dei 2 giornali con precisione al 2° numero decimale. È importante ricordare che la media viene fatta solo sui voti presenti per un calciatore; ad esempio se Totti prende 6 sul corriere, s.v sulla gazzetta, il voto finale sarà 6. Inoltre se un giornale assegna un gol a un giocatore, mentre un altro giornale non assegna il gol ma dà l'autogol al difensore, verrà presa in considerazione esclusivamente la decisione che prenderà pianetafantacalcio.it. Gli assist vengono presi esclusivamente dal Corriere dello Sport.",
      },
    ],
  },
  {
    id: 'sostituzioni-della-partita',
    title: 'Sostituzioni della partita',
    blocks: [
      {
        type: 'p',
        text: "Il numero massimo delle sostituzioni è fissato a 6 giocatori. Le sostituzioni seguono come sempre l'ordine del primo schierato per ciascun ruolo, secondariamente viene preso in considerazione il miglior voto (es.: non mi giocano 2 Dif, 2 Cen, 2 Att, tra le riserve mi entrerà la prima scelta del Dif, del Cen, dell'Att; come quarta riserva mi entrerà il migliore tra le seconde scelte). In caso non vi sia alcun sostituto il giocatore senza voto prende in automatico 3 come voto.",
      },
    ],
  },
  {
    id: 'bonus-malus',
    title: 'Bonus / Malus',
    blocks: [
      {
        type: 'list',
        items: [
          'Fattore casalingo: +2',
          'Gol fatto: +3',
          'Assist: +1',
          'Gol subito: -1',
          'Rigore sbagliato: -3',
          'Rigore parato: +3',
          'Ammonizione: -0,5',
          'Espulsione: -1',
          'Autogol: -2',
          'Portiere S.V.: 3',
          'Giocatore S.V.: 3',
        ],
      },
    ],
  },
  {
    id: 'calcolo-dei-gol',
    title: 'Calcolo dei gol',
    blocks: [
      {
        type: 'list',
        items: [
          'Punteggio 66: 1',
          'Punteggio 72: 2',
          'Punteggio 78: 3',
          'Punteggio 82: 4',
          'Punteggio 86: 5',
          'Punteggio 90: 6',
          'Punteggio 94: 7',
        ],
      },
    ],
  },
  {
    id: 'in-caso-di-parita-punti',
    title: 'In caso di parità punti',
    blocks: [
      {
        type: 'p',
        text: "A fine campionato o nei gironi della Champions League in caso di squadre a pari punti che lottano per una posizione che determina una vincita (o una penalità), si procederà seguendo nell'ordine i vari criteri:",
      },
      {
        type: 'list',
        items: [
          'Gol Fatti',
          'Differenza reti',
          'Scontri diretti (solo nel torneo chiamato in causa)',
          'Gol subiti',
        ],
      },
      {
        type: 'p',
        text: "Per le partite eliminatorie come la semifinale o la finale di champions in caso di partita che finisce in parità vincerà la squadra che ha realizzato il miglior fantapunteggio. Per la semifinale si calcolerà il fanta punteggio dell'andata più quello del ritorno. In caso di parità al fantapunteggio vincerà la squadra meglio piazzata in campionato (al momento della disputa).",
      },
    ],
  },
  {
    id: 'comunicazione-formazione-e-multe',
    title: 'Comunicazione formazione e multe',
    blocks: [
      {
        type: 'p',
        text: "La formazione va rilasciata sempre prima dell'inizio del primo anticipo di giornata. La formazione va inserita sempre sul sito tramite l'apposita funzionalità. In casi estremi la formazione può comunque essere comunicata in uno dei seguenti modi:",
      },
      {
        type: 'list',
        items: [
          'Tramite WhatsApp! Sul gruppo erFantacalcio',
          'Inviando una mail o un sms al presidente nei tempi stabiliti',
        ],
      },
      {
        type: 'p',
        text: "Nel caso una squadra non vengano rispettate le norme sopra stabilite, la squadra giocherà con la formazione della precedente giornata con l'handicap di prendere 0 punti indistintamente dal risultato maturato; in più pagherà una multa di 10 euro che arricchirà il montepremi del torneo generale.",
      },
      {
        type: 'p',
        text: 'Ciascun presidente ritardatario potrà, in autonomia, solo confermare la formazione precedente e giocarsela senza handicap.',
      },
    ],
  },
  {
    id: 'recuperi-partite-rinviate',
    title: 'Recuperi partite rinviate',
    blocks: [
      {
        type: 'p',
        text: "In caso di partite rinviate in serie A, si aspetterà il recupero della stessa per procedere all'aggiornamento dei voti del fantacalcio. Nel frattempo si aggiornerà la giornata impostando a tutte le partite di giornata il risultato di 0-0. Dopo il recupero, i giocatori schierati in formazione e non scesi in campo nella partita, avranno il 6 politico solo nel caso in cui non ci sia nessun sostituto disponibile.",
      },
    ],
  },
  {
    id: 'mercato-di-settembre',
    title: 'Mercato di settembre',
    blocks: [
      {
        type: 'p',
        text: 'Durante l\'asta ciascun presidente chiamerà un giocatore seguendo il consueto ordine (portieri, difensori, centrocampisti, attaccanti). Ogni presidente può chiamare 1 solo giocatore a sua scelta con la chiamata a busta. Al mercato di settembre ogni squadra partirà con 600 fantamilioni. Nel caso una squadra spenda più soldi di quelli concessi si procederà togliendo alla squadra il giocatore più pagato nel mercato; inoltre il giocatore tolto potrà essere comprato dalle altre squadre solo nel mercato di gennaio; la squadra penalizzata ovviamente non riprende nessun fantamilione dal giocatore perso. Per altre tipologie di illeciti voluti o non voluti durante il mercato iniziale si applicherà una multa che verrà decisa sul momento dalle persone non interessate direttamente nella questione. Suddetta multa andrà ad arricchire il montepremi del Campionato. Inoltre, dove possibile, il danno dovrà essere quanto prima "aggiustato" per riportare la situazione alla normalità. I giocatori non potranno più essere ceduti in cambio di soldi reali direttamente al presidente che vende; i giocatori messi sul mercato verranno battuti all\'asta e i soldi andranno solo sul montepremi generale.',
      },
    ],
  },
  {
    id: 'scambio-giocatori',
    title: 'Scambio giocatori',
    blocks: [
      {
        type: 'p',
        text: 'Al termine del mercato di settembre, ovvero quando sono state ultimate tutte le rose delle squadre, si può procedere con lo scambio dei giocatori usufruendo come merce di scambio i fantamilioni residui o un altro giocatore. Resta inteso che le rose devono rimanere inalterate nel numero fisso per ogni reparto di gioco.',
      },
    ],
  },
  {
    id: 'sessioni-di-mercato-sosta-nazionali',
    title: 'Sessioni di mercato sosta nazionali',
    blocks: [
      {
        type: 'p',
        text: 'Durante il periodo della sosta nazionali (orientativamente 11-17 novembre e 24-30 marzo) verrà creata una sessione di mercato sul sito.',
      },
      { type: 'p', text: 'La sessione di mercato prevede la scelta di:' },
      {
        type: 'list',
        items: [
          'una finestra temporale (data inizio, data fine)',
          'soldi reali o fantamilioni',
          'un numero massimo di proposte di acquisto per ciascuna squadra',
          'un numero massimo di giocatori acquistabili per ciascuna squadra',
        ],
      },
      {
        type: 'p',
        text: 'Per le sessioni di mercato in fantamilioni è previsto all\'apertura di ogni sessione un extra bonus di 30 fantamilioni oltre a quelli restanti del mercato di settembre/gennaio. Per le sessioni in soldi reali non sono previsti extra bonus e l\'offerta non è legata a vincoli.',
      },
      {
        type: 'p',
        text: 'Esistono due modalità di mercato, selezionabili dall\'amministratore al momento della creazione della sessione:',
      },
    ],
    subsections: [
      {
        title: 'Modalità Asta al Buio (fantamilioni o euro)',
        blocks: [
          {
            type: 'p',
            text: 'Ciascun presidente può effettuare delle proposte di acquisto indicando il costo e la priorità della proposta.',
          },
          {
            type: 'p',
            text: "Le proposte di acquisto non sono visibili agli altri presidenti fino alla chiusura della sessione di mercato (le proposte sono criptate, non visibili nemmeno dall'amministratore).",
          },
          {
            type: 'p',
            text: "Alla scadenza della sessione le offerte pervenute saranno visibili da tutti in trasparenza e si procederà all'acquisto dichiarando il giocatore da cedere.",
          },
          {
            type: 'p',
            text: "L'aggiudicazione avviene nel seguente modo:",
          },
          {
            type: 'list',
            items: [
              'regola base: per ogni giocatore vince la squadra che ha offerto il prezzo più alto. A parità di prezzo, vince chi ha inviato la proposta prima',
              'Cap acquisti: ogni squadra può aggiudicarsi al massimo gli acquisti effettivi concessi; se un presidente effettua 5 proposte e gli acquisti consentiti sono 2, prende i primi 2 giocatori in ordine di priorità su cui è il miglior offerente',
            ],
          },
        ],
      },
      {
        title: 'Modalità Asta in Chiaro (solo euro)',
        blocks: [
          {
            type: 'p',
            text: 'La modalità asta in chiaro è disponibile esclusivamente per le sessioni in soldi reali. A differenza dell\'asta al buio, tutte le offerte sono visibili in tempo reale a tutti i presidenti: per ogni giocatore si vede chi sta offrendo e a quale prezzo.',
          },
          {
            type: 'p',
            text: 'Le regole principali sono:',
          },
          {
            type: 'list',
            items: [
              'Tutti i giocatori svincolati sono disponibili contemporaneamente per tutta la durata della sessione',
              'Ogni squadra può fare un\'offerta su ciascun giocatore; l\'offerta può essere aggiornata (rilancio) in qualsiasi momento, ma deve essere strettamente superiore all\'offerta massima corrente sul quel giocatore',
              'Non è possibile ritirare un\'offerta già inviata',
              'Una volta fatta la prima offerta su un giocatore, si avvia un timer di 24 ore. Alla scadenza (o alla chiusura generale della sessione, se precedente) il giocatore viene aggiudicato al miglior offerente',
              'Il giocatore scompare dall\'elenco degli acquistabili non appena il suo timer scade, anche prima della conferma formale dell\'amministratore',
              'Cap acquisti: se una squadra ha già vinto un numero di aste pari agli acquisti effettivi consentiti, i successivi rilanci vengono bloccati automaticamente',
            ],
          },
          {
            type: 'p',
            text: "L'aggiudicazione effettiva di ogni giocatore viene confermata dall'amministratore al termine delle singole aste.",
          },
        ],
      },
    ],
  },
  {
    id: 'mercato-di-gennaio',
    title: 'Mercato di gennaio',
    blocks: [
      {
        type: 'p',
        text: 'Il mercato di riparazione si terrà, subito dopo la conclusione del mercato reale della serie A, fissato per il 31 gennaio. Per investire al mercato di gennaio si usano i fantamilioni restanti dal mercato di settembre; i fantamilioni restanti verranno tramutati in € secondo la seguente regola: 1 € = 5 fantamilioni. In caso di slittamenti del mercato le partite giocate in meno di 11 giocatori prevedono un 6 politico per ogni giocatore mancante in formazione. I giocatori non potranno più essere ceduti in cambio di soldi reali direttamente al presidente che vende; i giocatori messi sul mercato verranno battuti all\'asta e i soldi andranno solo sul montepremi generale.',
      },
      {
        type: 'p',
        text: 'Al mercato di riparazione in caso di alcune dimenticanze di aggiustamenti della rosa dovranno essere riparati quanto prima; eventuali partite giocate, prima della riparazione, andranno ricalcolate con il giocatore/i subentrato.',
      },
    ],
  },
  {
    id: 'cena-di-fine-stagione',
    title: 'Cena di fine stagione',
    blocks: [
      {
        type: 'p',
        text: 'Al termine della stagione Fanta calcistica è consuetudine partecipare alla cena per i saluti/insulti di fine anno. Alla cena verranno regolati i conti delle squadre e quindi assegnati i premi ai vincitori. Nell\'organizzazione della cena si cercherà di venire incontro a tutte le esigenze dei presidenti ma entro certi limiti.',
      },
    ],
  },
  {
    id: 'premi-stagionali',
    title: 'Premi stagionali',
    blocks: [
      { type: 'p', text: 'I premi sono così suddivisi:' },
      {
        type: 'list',
        items: [
          '55% al primo del campionato',
          '20% al secondo',
          '10% al secondo',
          '15% al vincitore della Champions.',
        ],
      },
    ],
  },
  {
    id: 'penalita-di-fine-stagione',
    title: 'Penalità di fine stagione',
    blocks: [
      {
        type: 'p',
        text: "Al termine della stagione, la squadra che si classifica nel campionato all'ultimo posto subirà, la prossima stagione, il cambio del nome della propria squadra. Gli altri 7 presidenti dovranno decidere il nuovo nome da assegnare alla squadra arrivata ultima.",
      },
    ],
  },
]

// ── Block renderers ────────────────────────────────────────────────────────

function BlockRenderer({ block }: { block: Block }) {
  if (block.type === 'p') {
    return (
      <Typography sx={{ mb: 1.5, lineHeight: 1.7 }}>{block.text}</Typography>
    )
  }
  if (block.type === 'list') {
    return (
      <List sx={{ mb: 1.5, py: 0 }} dense>
        {block.items.map((item, i) => (
          <ListItem key={i} sx={{ display: 'list-item', pl: 3, py: 0.25 }}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    )
  }
  return (
    <TableContainer component={Card} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {block.headers.map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700 }}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {block.rows.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => (
                <TableCell key={j}>{cell}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function RegolamentoPage() {
  return (
    <Box id="top" sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <MenuBook color="primary" />
        <Typography variant="h5">Regolamento erFantacalcio</Typography>
        <Chip
          label="2026-2027"
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Puoi anche{' '}
        <MuiLink href="/docs/Regolamento_erFantacalcio.docx">
          scaricare il documento originale
        </MuiLink>
        .
      </Typography>

      {/* Indice */}
      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Indice
        </Typography>
        <List dense sx={{ columns: { xs: 1, sm: 2 }, py: 0 }}>
          {sections.map((section) => (
            <ListItem
              key={section.id}
              sx={{ display: 'list-item', pl: 0, py: 0.25 }}
            >
              <MuiLink href={`#${section.id}`} underline="hover">
                {section.title}
              </MuiLink>
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Sezioni */}
      {sections.map((section, idx) => (
        <Box
          key={section.id}
          id={section.id}
          sx={{ scrollMarginTop: '80px', mb: 3 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {section.title}
            </Typography>
            <MuiLink
              href="#top"
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                ml: 1,
              }}
            >
              <KeyboardArrowUp fontSize="small" />
              Torna su
            </MuiLink>
          </Box>
          {section.blocks?.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
          {section.subsections?.map((sub) => (
            <Box key={sub.title} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {sub.title}
              </Typography>
              {sub.blocks.map((block, i) => (
                <BlockRenderer key={i} block={block} />
              ))}
            </Box>
          ))}
          {idx < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
        </Box>
      ))}
    </Box>
  )
}
