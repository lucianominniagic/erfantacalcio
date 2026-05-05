# ADR 001 — Password Hashing Strategy

**Status:** Decisione aperta (da confermare con Luciano)  
**Data:** 2026-05-05  
**Autore:** gibson (Auth Engineer)

---

## Contesto

ErFantacalcio usa NextAuth v5 con Credentials provider. L'autenticazione avviene confrontando la password inserita dall'utente con il valore memorizzato nel database tramite hash MD5.

---

## Stato attuale

| Aspetto | Valore |
|---|---|
| Algoritmo | MD5 (via `crypto-js`) |
| Colonna DB | `utente.pwd` — `varchar(50)` |
| Lunghezza hash | 32 caratteri hex (uppercase) |
| File | `src/utils/hashPassword.ts` |

```typescript
// src/utils/hashPassword.ts
import CryptoJS from 'crypto-js'

export function computeMD5Hash(password: string): string {
  return CryptoJS.MD5(password).toString().toUpperCase()
}
```

Il credentials provider in `src/server/auth.config.ts` chiama `computeMD5Hash(input.password)` e confronta il risultato con `utente.pwd` via query TypeORM.

---

## Rischi

### MD5 non è adatto al password hashing

MD5 è un algoritmo crittografico di **digest generale**, non un algoritmo di password hashing:

1. **Velocità**: MD5 può essere computato a miliardi di hash/secondo su GPU moderne. Questo lo rende banale da attaccare con brute-force o rainbow tables.
2. **Nessun salt**: l'implementazione attuale non applica alcun salt, rendendo gli hash identici per password identiche tra utenti diversi e vulnerabili ad attacchi con tabelle precompilate.
3. **Deprecato per sicurezza**: OWASP, NIST e PCI-DSS sconsigliano MD5 per password storage dal 2012.
4. **Lunghezza colonna limitante**: `varchar(50)` è compatibile con MD5 (32 char) ma non con bcrypt (60 char) o Argon2 (97+ char) senza migrazione dello schema.

### Impatto reale

ErFantacalcio è un'applicazione privata con utenti fidati (presidenti della stessa lega). Il rischio immediato di exploiting è basso. Tuttavia il rispetto delle best practice è consigliato anche in contesti interni.

---

## Opzioni

### Opzione A — Mantenere MD5 (status quo)

**Pro:**
- Zero effort di migrazione
- Nessun rischio di regressione

**Contro:**
- Non sicuro per password hashing (vedi Rischi)
- Debito tecnico accumulato

**Adatta se:** l'app rimane esclusivamente ad uso interno e con utenti fidati, e non si prevede di esporla a utenti anonimi.

---

### Opzione B — Migrare a bcrypt (raccomandata)

**Pro:**
- Algoritmo progettato specificamente per password hashing
- Salt automatico integrato
- Work factor configurabile (adattabile nel tempo)
- Standard de facto nel mondo Node.js/Next.js

**Contro:**
- Richiede migrazione DB (colonna `pwd` da `varchar(50)` a `varchar(72)` o `text`)
- Richiede rehashing delle password esistenti (lazy migration al primo login o reset forzato)

**Libreria:** `bcrypt` o `bcryptjs` (pure JS, senza dipendenze native)

---

### Piano di migrazione (se si sceglie Opzione B)

1. **Schema:** estendere `utente.pwd` a `varchar(72)` o `text` — migrazione TypeORM  
2. **hashPassword.ts:** aggiungere `hashBcrypt(password)` e `compareBcrypt(password, hash)`  
3. **Auth config:** nel `authorize()`, tentare prima `bcrypt.compare()`, poi fallback a MD5 per utenti non ancora migrati  
4. **Lazy migration:** al primo login con MD5 valido, sostituire l'hash con bcrypt nel DB  
5. **Cleanup:** dopo N mesi, rimuovere il fallback MD5

```typescript
// Esempio lazy migration in authorize()
const bcryptMatch = await bcrypt.compare(input.password, utente.pwd)
if (!bcryptMatch) {
  // Prova fallback MD5 (utente non ancora migrato)
  const md5Hash = computeMD5Hash(input.password)
  if (utente.pwd !== md5Hash) return null
  // Migra on-the-fly
  const newHash = await bcrypt.hash(input.password, 12)
  await Utenti.update({ idUtente: utente.idUtente }, { pwd: newHash })
}
```

---

## Raccomandazione

> **Migrare a bcrypt** (Opzione B) con lazy migration.  
> Il costo è basso (1-2 ore di lavoro), il beneficio in termini di sicurezza è significativo anche per applicazioni interne.

---

## Decisione

⏳ **Aperta** — da discutere e confermare con Luciano.

Vedi sezione "Decisioni aperte" nel `docs/REFACTORING_PLAN.md`.

---

## File coinvolti

- `src/utils/hashPassword.ts`
- `src/server/auth.config.ts`
- `src/server/db/entities/Utente.ts`
- Migrazione TypeORM da creare in `src/server/db/migrations/`
