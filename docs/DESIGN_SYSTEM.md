# ErFantacalcio — Design System

> **Stato**: Bozza — aggiornato durante FASE 4 del refactoring.
> Audit sx inline rimandato a FASE 6.

---

## Indice

1. [Stack & Tecnologie](#1-stack--tecnologie)
2. [Struttura del tema](#2-struttura-del-tema)
3. [Palette token — Dark Theme](#3-palette-token--dark-theme)
4. [Palette token — Light Theme](#4-palette-token--light-theme)
5. [Token semantici di dominio](#5-token-semantici-di-dominio)
6. [Typography](#6-typography)
7. [Overrides componenti](#7-overrides-componenti)
8. [Convenzioni di stile](#8-convenzioni-di-stile)
9. [Colori hardcoded — da risolvere in FASE 6](#9-colori-hardcoded--da-risolvere-in-fase-6)

---

## 1. Stack & Tecnologie

| Tecnologia | Versione |
|---|---|
| Next.js | 16 |
| MUI (Material UI) | v5 |
| TypeScript | ≥ 5 |
| Font | Montserrat (Google Fonts, caricato globalmente) |

---

## 2. Struttura del tema

```
src/theme/
├── index.ts          → Dark theme (themeOptions)
├── lightTheme.ts     → Light theme (lightThemeOptions)
├── mui.d.ts          → TypeScript module augmentation custom palette
├── themeContext.tsx  → Context dark/light toggle (localStorage)
└── overrides/
    ├── index.ts      → Merge di tutti gli override
    ├── Button.ts
    ├── Card.ts
    ├── CardContent.ts
    ├── CardHeader.ts
    ├── CssBaseline.ts → Dot-grid background animato
    ├── Chip.ts
    ├── DataGrid.ts
    ├── Tab.ts / Tabs.ts
    ├── TableCell.ts / TableHead.ts
    ├── Typography.ts
    └── ...
```

**Assemblaggio**: `src/ProvidersWrapper.tsx` — usa `useMemo` per ricreare il tema al toggle dark/light.

---

## 3. Palette token — Dark Theme

### Brand / Primary (Amber)

| Token | Valore | Uso |
|---|---|---|
| `primary.light` | `#FFD54F` | Titoli h2/h3/h5, accent testo |
| `primary.main` | `#FFC107` | Colore brand principale, action active |
| `primary.dark` | `#FF8F00` | Gradient start, hover button |

### Secondary (Gray)

| Token | Valore | Uso |
|---|---|---|
| `secondary.light` | `#cfcfcf` | Subtitle1 |
| `secondary.main` | `#9e9e9e` | Caption, subtitle2 |
| `secondary.dark` | `#707070` | Testo disabilitato, varianti scure |

### Semantic standard MUI

| Token | light | main | dark |
|---|---|---|---|
| `info` | `#82b1ff` | `#448aff` | `#2962ff` |
| `success` | `rgb(12,236,79)` ⚠️ | `rgb(8,204,67)` ⚠️ | `rgb(3,148,47)` ⚠️ |
| `error` | `#ff6f60` | `#e53935` | `#ab000d` |
| `warning` | `#ffe57f` | `#ffd740` | `#c8a600` |

> ⚠️ `success` usa formato `rgb()` invece di hex — da uniformare in FASE 6.

### Background & Surface

| Token | Valore | Uso |
|---|---|---|
| `background.default` | `#0d0d14` | Sfondo pagina, colore testo button contained |
| `background.paper` | `#16161f` | Card, Paper, Modal |

### Testo

| Token | Valore |
|---|---|
| `text.primary` | `#f5f5f5` |
| `text.secondary` | `#bdbdbd` |

### Divider & Action

| Token | Valore |
|---|---|
| `divider` | `rgba(255, 193, 7, 0.12)` |
| `action.active` | `#FFC107` |
| `action.hover` | `rgba(255, 193, 7, 0.08)` |

### Champions (Purple — modalità Champions)

| Token | Valore |
|---|---|
| `champions.main` | `#c084fc` |
| `champions.light` | `#d8b4fe` |
| `champions.dark` | `#9333ea` |
| `champions.contrastText` | `#fff` |

---

## 4. Palette token — Light Theme

| Token | Valore | Note |
|---|---|---|
| `primary.light` | `#FFD54F` | |
| `primary.main` | `#FF8F00` | Più scuro per contrasto su sfondo chiaro |
| `primary.dark` | `#E65100` | |
| `secondary.main` | `#616161` | |
| `background.default` | `#f0f0f5` | |
| `background.paper` | `#ffffff` | |
| `text.primary` | `#1a1a2e` | |
| `text.secondary` | `#4a4a6a` | |
| `divider` | `rgba(255, 143, 0, 0.2)` | |
| `champions.main` | `#7c3aed` | |

---

## 5. Token semantici di dominio

### Ruoli Giocatore (`palette.ruolo`)

Token aggiunti in **FASE 4**. Rappresentano i quattro ruoli del fantacalcio.

#### Dark Theme

| Token | Valore | Ruolo |
|---|---|---|
| `ruolo.P` | `#9e9e9e` | Portiere — grigio neutro |
| `ruolo.D` | `#448aff` | Difensore — blu (= `info.main`) |
| `ruolo.C` | `#FFC107` | Centrocampista — ambra (= `primary.main`) |
| `ruolo.A` | `#e53935` | Attaccante — rosso (= `error.main`) |

#### Light Theme

| Token | Valore | Ruolo |
|---|---|---|
| `ruolo.P` | `#757575` | Portiere |
| `ruolo.D` | `#2962ff` | Difensore (= `info.dark`) |
| `ruolo.C` | `#FF8F00` | Centrocampista (= `primary.main`) |
| `ruolo.A` | `#c62828` | Attaccante |

**Uso corretto:**

```tsx
// ✅ Corretto
sx={{ borderColor: theme.palette.ruolo[g.ruolo] }}
sx={{ color: theme.palette.ruolo.A }}

// ❌ Sbagliato — era il vecchio pattern inconsistente
// (ViewTabellini usava secondary.dark/info.dark/action.hover/error.dark)
// (Rosa usava Chip color="error"|"success"|"info"|"default")
```

> **FASE 6**: migrare `getColorByRuolo()` in `ViewTabellini.tsx` e `RUOLO_COLOR` in `Rosa.tsx` a `theme.palette.ruolo`.

### Fantapunti (positivo / negativo)

Non esistono token separati: usare i token MUI standard.

| Stato | Token da usare | Valore dark |
|---|---|---|
| Positivo (score > 6) | `success.main` | `rgb(8, 204, 67)` |
| Negativo (score < 6) | `error.main` | `#e53935` |
| Neutro (score = 6) | `text.secondary` | `#bdbdbd` |

### Tipi File (documenti)

Attualmente hardcoded in `src/app/(user)/documenti/page.tsx`. Mappatura consigliata verso token esistenti:

| Tipo | Colore attuale | Token suggerito |
|---|---|---|
| PDF | `#dc2626` | `error.main` |
| XLSX | `#16a34a` | `success.main` |
| CSV | `#2563eb` | `info.main` |

> **FASE 6**: aggiornare `documenti/page.tsx` per usare i token palette.

### Overlay Amber (superfici trasparenti)

Pattern ricorrente: `rgba(255, 193, 7, X)`. Usare sempre `alpha()` di MUI.

```tsx
import { alpha } from '@mui/material/styles'

// ✅ Corretto
alpha(theme.palette.primary.main, 0.08)   // action hover
alpha(theme.palette.primary.main, 0.12)   // divider / bordo card
alpha(theme.palette.primary.main, 0.15)   // card header bg start
alpha(theme.palette.primary.main, 0.28)   // card hover border

// ❌ Sbagliato
'rgba(255, 193, 7, 0.08)'
```

---

## 6. Typography

Font: **Montserrat** — caricato globalmente, nessun font display secondario.

| Variante | Colore (dark) | Weight | Dimensione |
|---|---|---|---|
| `h1` | `text.primary` (`#f5f5f5`) | 700 | 2rem |
| `h2` | `primary.light` (`#FFD54F`) | 700 | 1.675rem |
| `h3` | `primary.light` (`#FFD54F`) | 600 | 1.4rem |
| `h4` | gradient amber-gold ✨ | 700 | 1.1rem |
| `h5` | `primary.light` (`#FFD54F`) | 600 | 0.9rem |
| `h6` | `text.secondary` (`#bdbdbd`) | 400 | 0.875rem |
| `body1` | `text.secondary` (`#bdbdbd`) | 400 | 0.75rem |
| `body2` | `text.secondary` (`#bdbdbd`) | 400 | 0.75rem |
| `subtitle1` | `#cfcfcf` | 600 | 0.875rem |
| `subtitle2` | `#9e9e9e` | 500 | 0.75rem |
| `caption` | `#9e9e9e` | 400 | 0.75rem |
| `button` | — | 600 | 0.875rem, capitalize |

> **NOTA**: I colori tipografici in `index.ts` e `lightTheme.ts` sono hardcoded per necessità (sono la definizione stessa della palette). **Non** replicare questi valori nei componenti — usare `variant="h2"` o `color="text.secondary"`.

---

## 7. Overrides componenti

### Button (`overrides/Button.ts`)

- `containedPrimary` → gradient amber `#FF8F00 → #FFC107`, testo `background.default`
- `outlinedPrimary` → bordo amber, hover amber
- **VIETATO** `color="info"` o `color="warning"` sui `<Button>`

> ⚠️ **FASE 6**: migrare i valori hardcoded a `theme.palette.primary.*` e `theme.palette.background.default`.

### Card (`overrides/Card.ts`)

- `borderRadius: 12px`
- Bordo: `rgba(255, 193, 7, 0.12)` → da migrare a `theme.palette.divider`
- Hover: border più opaco + shadow amber
- `backdropFilter: blur(8px)`

### CardHeader (`overrides/CardHeader.ts`)

- Gradient `rgba(255,143,0,0.15) → rgba(255,193,7,0.08)` → **FASE 6**: usare `alpha()`
- Bordo inferiore: `theme.palette.divider`

### DataGrid (`overrides/DataGrid.ts`)

- Column header dark bg: `#393027` — colore brownish-amber senza token. **FASE 6**: nominarlo o derivarlo con `darken(theme.palette.primary.dark, 0.85)`

### CssBaseline (`overrides/CssBaseline.ts`)

- Dot-grid animato (`dotPulse` 6s ease-in-out)
- Dark: `rgba(255, 193, 7, 0.12)` amber dots
- Light: `rgba(180, 120, 0, 0.09)` ochre dots
- Fixed, `pointer-events: none`, `z-index: 0`

### LoadingSpinner

Standard loader = `<LoadingSpinner />` da `~/components/LinearProgressBar/LoadingSpinner`.
Implementazione: `CircularProgress color="warning"` centrato.
**Non** usare `<CircularProgress>` direttamente nei componenti.

---

## 8. Convenzioni di stile

### Gerarchia: dove mettere gli stili

| Caso | Dove |
|---|---|
| Stile globale per componente MUI (es. tutti i Card) | `src/theme/overrides/ComponentName.ts` |
| Stile applicato a una variante specifica in più punti | Prop `sx` con token palette |
| Stile one-off per singolo componente | Prop `sx` inline con token palette |
| Componente styled riusabile con logica visuale | `styled()` di MUI |

### Regole colori

```tsx
// ✅ Corretto — token palette
sx={{ color: 'primary.main' }}
sx={{ bgcolor: 'background.paper' }}
sx={{ color: theme.palette.text.secondary }}

// ✅ Corretto — colori derivati
import { alpha, darken } from '@mui/material/styles'
alpha(theme.palette.primary.main, 0.12)
darken(theme.palette.primary.dark, 0.85)

// ❌ Sbagliato — hardcoded
sx={{ color: '#FFC107' }}
sx={{ color: isDark ? 'rgba(251,191,36,0.75)' : 'rgba(255,255,255,0.85)' }}
```

### Aggiungere un nuovo design token

1. Aggiungi in `src/theme/index.ts` (dark)
2. Aggiungi in `src/theme/lightTheme.ts` (light)
3. Se è una palette personalizzata, augmenta `src/theme/mui.d.ts`

### Aggiungere un nuovo component override

1. Crea `src/theme/overrides/ComponentName.ts`
2. Esporta `function ComponentName(theme: Theme)` che ritorna l'oggetto MUI override
3. Importa e registra in `src/theme/overrides/index.ts`

---

## 9. Colori hardcoded — da risolvere in FASE 6

> **Perimetro audit FASE 4**: solo `src/theme/` e `src/app/`.
> Audit completo degli `sx` inline nei componenti rimandato a **FASE 6**.

### `src/theme/overrides/` — problemi da correggere

| File | Riga | Valore | Sostituzione consigliata |
|---|---|---|---|
| `Button.ts` | 27 | `#FF8F00` | `theme.palette.primary.dark` |
| `Button.ts` | 27 | `#FFC107` | `theme.palette.primary.main` |
| `Button.ts` | 28 | `#0d0d14` | `theme.palette.background.default` |
| `Button.ts` | 30 | `#FFC107` | `theme.palette.primary.main` |
| `Button.ts` | 30 | `#FFD54F` | `theme.palette.primary.light` |
| `Button.ts` | 39 | `#FFC107` | `theme.palette.primary.main` |
| `Card.ts` | 12 | `rgba(255,193,7,0.12)` | `theme.palette.divider` |
| `Card.ts` | 16 | `rgba(255,193,7,0.28)` | `alpha(theme.palette.primary.main, 0.28)` |
| `Card.ts` | 17 | `rgba(255,193,7,0.08)` | `theme.palette.action.hover` |
| `CardHeader.ts` | 12 | gradiente rgba | `alpha(theme.palette.primary.dark/main, X)` |
| `CardHeader.ts` | 13 | `rgba(255,193,7,0.12)` | `theme.palette.divider` |
| `DataGrid.ts` | 19 | `#393027` | `darken(theme.palette.primary.dark, 0.85)` o nuovo token |
| `DataGrid.ts` | 20 | `#fff` | `theme.palette.common.white` |
| `TableHead.ts` | 13 | gradiente hex | `theme.palette.primary.dark → primary.main` |
| `TableHead.ts` | 19 | `#0d0d14` | `theme.palette.background.default` |

### `src/app/` — problemi da correggere

| File | Problema |
|---|---|
| `(user)/foto/page.tsx` | 10+ colori amber hardcoded + `#4caf50`, `#000` |
| `(user)/documenti/page.tsx` | `#16a34a`, `#2563eb`, `#dc2626` (file types) |
| `login/page.tsx` | Gradient hardcoded, `#0d0d14` |

### `src/theme/index.ts` — minori

| Problema | Azione |
|---|---|
| `success` usa `rgb()` invece di hex | Convertire in FASE 6 |
| Typography colors hardcoded (es. `h2: { color: '#FFD54F' }`) | Accettabile come fonte di verità — non replicare nei componenti |

---

*Ultima modifica: FASE 4 — asimov*
