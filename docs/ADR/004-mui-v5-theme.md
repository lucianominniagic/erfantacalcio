# ADR 004 — MUI v5 as UI Framework with Custom Dark/Light Theme

**Status:** ✅ Accepted  
**Date:** 2025-07-14  
**Author:** asimov (Design System Engineer)

---

## Context

ErFantacalcio needs a component library that covers data-heavy UIs (tables, forms, data grids, charts) with a consistent design language, supports dark mode (the primary mode), and integrates well with React 19 and Next.js 16.

The primary alternatives evaluated were:

1. **MUI v5** (Material UI — component library with theme engine)
2. **Tailwind CSS** (utility-first CSS framework)
3. **shadcn/ui** (headless components + Tailwind, copy-paste model)

---

## Decision

Use **MUI v5** (`@mui/material`, `@mui/x-data-grid`, `@mui/x-charts`) with a fully custom dark/light theme defined in `src/theme/`.

---

## Reasons for not choosing Tailwind CSS

| Concern | Tailwind approach |
|---|---|
| Data tables | No built-in data table; requires a third-party library anyway |
| Theme engine | No centralized semantic token system; dark mode via class toggling |
| Consistency | Utility classes are applied inline; easy to diverge across components |
| Charts | No official chart library in the Tailwind ecosystem |

MUI provides `DataGrid`, `Charts`, `DatePicker` and other complex components out of the box, which are heavily used in ErFantacalcio (classifica, statistiche, upload voti).

---

## Reasons for not choosing shadcn/ui

| Concern | shadcn/ui approach |
|---|---|
| Copy-paste model | Components are copied into the project; updates are manual |
| Data Grid | No equivalent to `@mui/x-data-grid` with sorting, filtering, export |
| Maturity | shadcn is newer; MUI has a more battle-tested theme system for complex apps |
| Tailwind dependency | Would still require Tailwind, adding a parallel styling system |

---

## Consequences

### Positive

- **Complete component library**: buttons, cards, dialogs, data grids, charts, autocomplete, tabs — all from one source.
- **Centralized theming**: all design tokens (colors, typography, spacing, shadows) live in `src/theme/`. Global changes require editing one file.
- **Semantic palette tokens**: custom tokens like `custom.win`, `custom.lose`, `custom.draw`, `custom.portiere`, `custom.difensore`, etc. are defined in the MUI palette augmentation (`src/theme/mui.d.ts`) for type-safe access.
- **Dark mode first**: the dark theme (`src/theme/index.ts`) is the primary theme; the light theme (`src/theme/lightTheme.ts`) is a secondary option toggled via `ThemeContext` (stored in `localStorage`).
- **Component overrides**: global overrides for MUI components (buttons, cards, DataGrid, chips, tabs, table cells) are centralized in `src/theme/overrides/` and merged in `src/theme/overrides/index.ts`. No inline `sx` overrides for global styles.

### Negative / Trade-offs

- **Bundle size**: MUI is larger than Tailwind + shadcn for projects that only need simple layouts. Acceptable given the complexity of the UIs in ErFantacalcio.
- **`sx` prop discipline**: MUI's `sx` prop is available everywhere but should only be used for **one-off** instance overrides, not global patterns. Global patterns must go in `src/theme/overrides/`.
- **No Tailwind**: developers familiar with Tailwind need to learn MUI's `sx` / `styled` API.

---

## Theme structure

```
src/theme/
├── index.ts            # Dark theme (themeOptions) — primary
├── lightTheme.ts       # Light theme (lightThemeOptions) — secondary
├── mui.d.ts            # TypeScript module augmentation for custom palette tokens
├── themeContext.tsx    # React context for dark/light toggle (persisted to localStorage)
└── overrides/
    ├── index.ts        # Merges all overrides into a single object
    ├── Button.ts
    ├── Card.ts
    ├── CardContent.ts
    ├── CardHeader.ts
    ├── CssBaseline.ts  # Dot-grid animated background
    ├── Chip.ts
    ├── DataGrid.ts
    ├── Tab.ts
    ├── Tabs.ts
    ├── TableCell.ts
    └── TableHead.ts
```

## Conventions

1. **Never use hardcoded color strings** in component files. Use `theme.palette.*` or semantic tokens from `custom.*`.
2. **One-off layout adjustments** → use `sx` prop.
3. **Repeated style patterns** → add a component override in `src/theme/overrides/<Component>.ts`.
4. **New design tokens** → augment `src/theme/mui.d.ts` and add the value to both `index.ts` (dark) and `lightTheme.ts` (light).

---

## Files involved

- `src/theme/index.ts`
- `src/theme/lightTheme.ts`
- `src/theme/mui.d.ts`
- `src/theme/themeContext.tsx`
- `src/theme/overrides/`
- `src/ProvidersWrapper.tsx` — applies the theme via `ThemeProvider`
