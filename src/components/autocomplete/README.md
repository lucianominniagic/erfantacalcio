# Autocomplete Components

Questa cartella contiene componenti autocomplete riutilizzabili e astratti.

## Componenti

### GenericAutocomplete

Componente autocomplete generico e completamente configurabile che può essere utilizzato per qualsiasi tipo di dato.

#### Caratteristiche

- **Generico e type-safe**: Usa TypeScript generics per garantire type safety
- **Altamente configurabile**: Molte props opzionali per personalizzare il comportamento
- **Free text input**: Supporto per input di testo libero
- **Custom input suggestions**: Possibilità di aggiungere suggerimenti personalizzati
- **Loading states**: Supporto per stati di caricamento
- **Controlled/Uncontrolled**: Può essere usato in modalità controlled o uncontrolled

#### Props

```typescript
interface AutocompleteOption {
  id: number | string | null
  label: string
}

interface GenericAutocompleteProps<T extends AutocompleteOption> {
  items: T[] // Array di elementi da visualizzare
  onItemSelected: (id, text) => void // Callback quando un elemento è selezionato
  label?: string // Label del campo (default: "Cerca")
  placeholder?: string // Placeholder text
  size?: 'small' | 'medium' // Dimensione (default: 'small')
  width?: number | string // Larghezza (default: 300)
  freeSolo?: boolean // Input libero (default: true)
  allowCustomInput?: boolean // Suggerimenti custom (default: true)
  disabled?: boolean // Disabilita il componente
  loading?: boolean // Stato di caricamento
  sx?: SxProps<Theme> // Stili custom
  textFieldProps?: TextFieldProps // Props da passare al TextField
  // ... altre props
}
```

#### Esempio Base

```tsx
import {
  GenericAutocomplete,
  AutocompleteOption,
} from '~/components/autocomplete'

interface Player extends AutocompleteOption {
  id: number
  label: string
  team?: string
}

function PlayerSelector() {
  const players: Player[] = [
    { id: 1, label: 'Mario Rossi', team: 'Team A' },
    { id: 2, label: 'Luigi Verdi', team: 'Team B' },
  ]

  const handleSelect = (
    id: number | string | null | undefined,
    text: string | undefined,
  ) => {
    if (id) {
      console.log('Selected player ID:', id)
    } else if (text) {
      console.log('Custom text entered:', text)
    }
  }

  return (
    <GenericAutocomplete
      items={players}
      onItemSelected={handleSelect}
      label="Seleziona giocatore"
      placeholder="Cerca per nome..."
    />
  )
}
```

#### Esempio con Props Avanzate

```tsx
import { GenericAutocomplete } from '~/components/autocomplete'

function AdvancedExample() {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState([])

  return (
    <GenericAutocomplete
      items={items}
      onItemSelected={(id, text) => console.log(id, text)}
      label="Ricerca avanzata"
      size="medium"
      width={400}
      loading={loading}
      disabled={false}
      freeSolo={true}
      allowCustomInput={true}
      sx={{ backgroundColor: 'white' }}
      textFieldProps={{
        helperText: 'Inserisci almeno 3 caratteri',
        variant: 'outlined',
      }}
    />
  )
}
```

### AutocompleteGiocatore

Wrapper specifico di `GenericAutocomplete` per la selezione di giocatori. Mantiene la compatibilità con il codice esistente.

#### Esempio

```tsx
import { AutocompleteGiocatore } from '~/components/autocomplete'

function GiocatoriPage() {
  const giocatori = [
    { id: 1, label: 'Mario Rossi' },
    { id: 2, label: 'Luigi Verdi' },
  ]

  const handleSelect = (
    idGiocatore: number | undefined,
    inputValue: string | undefined,
  ) => {
    if (idGiocatore) {
      console.log('Selected player ID:', idGiocatore)
    } else if (inputValue) {
      console.log('Custom input:', inputValue)
    }
  }

  return (
    <AutocompleteGiocatore
      items={giocatori}
      onItemSelected={handleSelect}
      label="Cerca giocatore"
    />
  )
}
```

## Export

Il file `index.ts` esporta tutti i componenti e tipi:

```typescript
// Import del componente generico
import {
  GenericAutocomplete,
  AutocompleteOption,
} from '~/components/autocomplete'

// Import del componente specifico per giocatori
import {
  AutocompleteGiocatore,
  AutocompleteTextbox,
} from '~/components/autocomplete'
```

## Migrazione

Se stai usando il vecchio `AutocompleteTextbox`, non è necessaria alcuna modifica. Il componente continua a funzionare come prima, ma ora è un wrapper del componente generico.

Per nuovi componenti autocomplete, usa direttamente `GenericAutocomplete` per maggiore flessibilità.

## Best Practices

1. **Usa GenericAutocomplete per nuovi componenti** invece di duplicare il codice
2. **Estendi AutocompleteOption** se hai bisogno di campi aggiuntivi
3. **Sfrutta i TypeScript generics** per garantire type safety
4. **Configura solo le props necessarie** - usa i defaults quando possibile
5. **Usa React.useCallback** per le funzioni callback per evitare re-render inutili

## Esempio: Creare un Nuovo Autocomplete Specializzato

```tsx
// AutocompleteSquadra.tsx
import React from 'react'
import GenericAutocomplete, { AutocompleteOption } from './GenericAutocomplete'

interface Squadra extends AutocompleteOption {
  id: number
  label: string
  colore?: string
}

interface AutocompleteSquadraProps {
  squadre: Squadra[]
  onSquadraSelected: (id: number | undefined) => void
}

export default function AutocompleteSquadra({
  squadre,
  onSquadraSelected,
}: AutocompleteSquadraProps) {
  const handleSelect = React.useCallback(
    (id: string | number | null | undefined) => {
      const numericId = typeof id === 'number' ? id : undefined
      onSquadraSelected(numericId)
    },
    [onSquadraSelected],
  )

  return (
    <GenericAutocomplete
      items={squadre}
      onItemSelected={handleSelect}
      label="Seleziona squadra"
      allowCustomInput={false} // Non permettere input custom per le squadre
    />
  )
}
```
