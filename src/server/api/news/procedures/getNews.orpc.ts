/**
 * getNews.orpc — endpoint pubblico per la pagina "News Calcio".
 *
 * Non richiede autenticazione (publicProcedure) né input parametri:
 * restituisce sempre i quattro feed RSS in parallelo.
 *
 * La risposta è già validata da newsCalcioResponseSchema nel service layer.
 */
import { publicProcedure } from '~/server/orpc'
import { fetchAllNewsFeeds } from '../services/newsService'

export const getNewsORPCProcedure = publicProcedure
  .route({
    method: 'GET',
    path: '/news/feeds',
    summary: 'Feed RSS Gazzetta dello Sport — quattro sezioni news calcio',
  })
  .handler(async () => fetchAllNewsFeeds())
