# Card Components

Componenti card riutilizzabili e configurabili basati su Material-UI Card.

## Componenti

### GenericCard

Componente card generico con header, content e actions completamente configurabili.

#### Caratteristiche

- **Header configurabile**: Title, subtitle, avatar, action buttons
- **Content flessibile**: Qualsiasi contenuto React
- **Actions footer**: Pulsanti e azioni nel footer
- **Divisori opzionali**: Tra header, content e footer
- **Clickable**: Supporto per card cliccabili con hover effect
- **Paper wrapper**: Opzionale wrapping in Paper
- **Elevazione personalizzabile**
- **Completamente stylabile** con sx props

#### Props Principali

```typescript
interface GenericCardProps {
  title?: React.ReactNode // Titolo
  subtitle?: React.ReactNode // Sottotitolo
  avatar?: React.ReactNode // Avatar o icona
  headerAction?: React.ReactNode // Azioni nell'header
  children: React.ReactNode // Contenuto
  actions?: React.ReactNode // Azioni nel footer
  maxWidth?: string | number // Larghezza massima
  elevation?: number // Elevazione (default: 1)
  withPaper?: boolean // Wrap in Paper
  clickable?: boolean // Card cliccabile
  onClick?: () => void // Handler click
  showHeaderDivider?: boolean // Divisore dopo header
  showActionsDivider?: boolean // Divisore prima azioni
  titleVariant?: TypographyVariant // Variante titolo
  // ... altre props
}
```

#### Esempi di Utilizzo

##### Card Base

```tsx
import { GenericCard } from '~/components/cards'
;<GenericCard title="Titolo Card" subtitle="Sottotitolo">
  <Typography>Contenuto della card</Typography>
</GenericCard>
```

##### Card con Avatar e Actions

```tsx
import { GenericCard } from '~/components/cards'
import { Avatar, Button } from '@mui/material'
;<GenericCard
  title="Profilo Utente"
  subtitle="Utente attivo"
  avatar={<Avatar src="/avatar.jpg" alt="User" />}
  showHeaderDivider
  showActionsDivider
  actions={
    <>
      <Button>Modifica</Button>
      <Button color="error">Elimina</Button>
    </>
  }
>
  <Typography>Nome: Mario Rossi</Typography>
  <Typography>Email: mario@example.com</Typography>
</GenericCard>
```

##### Card Cliccabile

```tsx
import { useNavigate } from 'next/navigation'
;<GenericCard
  title="Clicca per dettagli"
  subtitle="Card interattiva"
  clickable
  onClick={() => navigate('/details/123')}
>
  <Typography>Questa card è cliccabile</Typography>
</GenericCard>
```

##### Card con Header Action

```tsx
<GenericCard
  title="Notifiche"
  subtitle="3 nuove notifiche"
  headerAction={
    <IconButton>
      <MoreVertIcon />
    </IconButton>
  }
>
  <List>
    <ListItem>Notifica 1</ListItem>
    <ListItem>Notifica 2</ListItem>
  </List>
</GenericCard>
```

##### Card con Paper Wrapper

```tsx
<GenericCard title="Card con Paper" withPaper elevation={3} maxWidth={600}>
  <Typography>Contenuto wrappato in Paper</Typography>
</GenericCard>
```

##### Card con Stili Custom

```tsx
<GenericCard
  title="Custom Styled Card"
  sx={{
    backgroundColor: 'primary.light',
    border: '2px solid',
    borderColor: 'primary.main',
  }}
  headerSx={{ backgroundColor: 'primary.main', color: 'white' }}
  contentSx={{ padding: 4 }}
>
  <Typography>Contenuto con stili personalizzati</Typography>
</GenericCard>
```

### CardWithActions

Card specializzata per form e azioni con gestione messaggi integrata.

#### Caratteristiche

- **Gestione messaggi**: Success e error messages integrati
- **Supporto form**: Può renderizzare come `<form>`
- **Actions configurabili**: Direction, justify, spacing
- **Alert automatici**: Alert per success/error
- **Tutto di GenericCard**: Eredita tutte le features

#### Props Aggiuntive

```typescript
interface CardWithActionsProps extends GenericCardProps {
  successMessage?: string // Messaggio successo
  errorMessage?: string // Messaggio errore
  loading?: boolean // Stato loading
  onSubmit?: (event) => void // Handler submit form
  asForm?: boolean // Render come form
  actionsDirection?: 'row' | 'column' // Direzione azioni
  actionsJustify?: JustifyContent // Allineamento azioni
  actionsSpacing?: number // Spaziatura azioni
}
```

#### Esempi di Utilizzo

##### Form Card

```tsx
import { CardWithActions } from '~/components/cards'
import { Button, TextField, Stack } from '@mui/material'

function EditUserForm() {
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Logica di salvataggio
      setSuccess('Utente salvato con successo!')
      setError('')
    } catch (err) {
      setError('Errore nel salvataggio')
      setSuccess('')
    }
  }

  return (
    <CardWithActions
      title="Modifica Utente"
      subtitle="Aggiorna le informazioni"
      asForm
      onSubmit={handleSubmit}
      successMessage={success}
      errorMessage={error}
      showActionsDivider
      actions={
        <>
          <Button type="button" onClick={handleCancel}>
            Annulla
          </Button>
          <Button type="submit" variant="contained">
            Salva
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <TextField label="Nome" required />
        <TextField label="Email" type="email" required />
        <TextField label="Telefono" />
      </Stack>
    </CardWithActions>
  )
}
```

##### Card con Conferma

```tsx
<CardWithActions
  title="Conferma Eliminazione"
  subtitle="Questa azione non può essere annullata"
  errorMessage={error}
  actions={
    <>
      <Button onClick={handleCancel}>Annulla</Button>
      <Button variant="contained" color="error" onClick={handleDelete}>
        Elimina
      </Button>
    </>
  }
  actionsJustify="space-between"
>
  <Typography>Sei sicuro di voler eliminare questo elemento?</Typography>
</CardWithActions>
```

##### Card con Actions Verticali

```tsx
<CardWithActions
  title="Azioni"
  actionsDirection="column"
  actionsSpacing={2}
  actions={
    <>
      <Button variant="contained" fullWidth>
        Azione 1
      </Button>
      <Button variant="outlined" fullWidth>
        Azione 2
      </Button>
      <Button fullWidth>Azione 3</Button>
    </>
  }
>
  <Typography>Seleziona un'azione</Typography>
</CardWithActions>
```

## Best Practices

1. **Usa GenericCard** per card semplici di visualizzazione
2. **Usa CardWithActions** per form e interazioni che richiedono feedback
3. **Sfrutta showHeaderDivider e showActionsDivider** per separare visivamente le sezioni
4. **Usa clickable** solo quando tutta la card è cliccabile, altrimenti usa button specifici
5. **Imposta maxWidth** per controllo del layout responsive
6. **Usa titleVariant e subtitleVariant** per gerarchie visive corrette
7. **Memoizza callbacks** per evitare re-render inutili

## Migrazioni Comuni

### Da Card MUI base

```tsx
// Prima
<Card>
  <CardHeader title="Titolo" />
  <CardContent>
    <Typography>Contenuto</Typography>
  </CardContent>
  <CardActions>
    <Button>Azione</Button>
  </CardActions>
</Card>

// Dopo
<GenericCard
  title="Titolo"
  actions={<Button>Azione</Button>}
>
  <Typography>Contenuto</Typography>
</GenericCard>
```

### Da Card con Paper

```tsx
// Prima
<Paper elevation={0}>
  <Card>
    <CardHeader title="Titolo" />
    <CardContent>Contenuto</CardContent>
  </Card>
</Paper>

// Dopo
<GenericCard
  title="Titolo"
  withPaper
  elevation={1}
>
  Contenuto
</GenericCard>
```

## Composizione

I componenti card possono essere combinati con altri componenti:

```tsx
<GenericCard
  title="Dashboard"
  actions={
    <GenericModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      title="Dettagli"
    >
      <Typography>Dettagli...</Typography>
    </GenericModal>
  }
>
  <Grid container spacing={2}>
    <Grid item xs={12} md={6}>
      <GenericCard title="Metrica 1">
        <Typography variant="h3">42</Typography>
      </GenericCard>
    </Grid>
    <Grid item xs={12} md={6}>
      <GenericCard title="Metrica 2">
        <Typography variant="h3">24</Typography>
      </GenericCard>
    </Grid>
  </Grid>
</GenericCard>
```
