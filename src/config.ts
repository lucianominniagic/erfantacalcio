/**
 * Re-esporta `Configurazione` da `~/config/index`.
 * Questo file è mantenuto per backward compatibility: tutti i consumer
 * esistenti che importano da `~/config` continuano a funzionare senza modifiche.
 *
 * @see src/config/index.ts per la struttura modulare con validazione Zod.
 */
export { Configurazione } from './config/index'
