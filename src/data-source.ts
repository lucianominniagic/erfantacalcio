import 'reflect-metadata'
import { DataSource } from 'typeorm'
import 'dotenv/config'
import pg from 'pg'
import { NamingStrategy } from './server/db/utils/namingStrategy'
import { join } from 'path'
import * as Entities from './server/db/entities'

// Incremental migration: do NOT enable synchronize in production.
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  migrations: [join(__dirname, 'server/db/migrations/*.{js,ts}')],
  entities: [
    Entities.AlboTrofei,
    Entities.Calendario,
    Entities.Classifiche,
    Entities.Giocatori,
    Entities.Formazioni,
    Entities.FlowNewSeason,
    Entities.Trasferimenti,
    Entities.Tornei,
    Entities.Utenti,
    Entities.StatsP,
    Entities.StatsD,
    Entities.StatsC,
    Entities.StatsA,
    Entities.SquadreSerieA,
    Entities.SerieA,
    Entities.Partite,
    Entities.Voti,
  ],
  namingStrategy: new NamingStrategy(),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: ['migration', 'error', 'warn'],
  logger: 'formatted-console',
})

// Global parser for Postgres `numeric`/`decimal` (OID 1700)
// Convert string values like "6.5" to JS `number` by default.
// Keep this as a simple parseFloat conversion; if you need exact
// decimal arithmetic, prefer using `decimal.js` and remove this parser.
try {
  pg.types.setTypeParser(1700, (val: string | null) =>
    val === null ? null : parseFloat(val.replace(',', '.')),
  )
} catch (error) {
  // If pg is not present or parser cannot be set, ignore silently.
  // This shouldn't happen in normal runtime.
  // eslint-disable-next-line no-console
  console.debug('pg.types.setTypeParser not applied:', error)
}

// Persist DataSource and initialization promise across module reloads (Next.js HMR)
export const initializeDBConnection = async (): Promise<DataSource> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize()
  }
  return AppDataSource
}
