/**
 * Client oRPC lato frontend.
 *
 * Usa RPCLink di @orpc/client per puntare all'handler montato su /api/orpc,
 * e createTanstackQueryUtils di @orpc/tanstack-query per generare queryOptions
 * compatibili con TanStack Query v5.
 *
 * Il QueryClient è provisionato da QueryClientProvider in ProvidersWrapper.
 */
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

import type { ORPCRouter } from '~/server/orpc-root'

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 8080}`
}

const link = new RPCLink({
  url: `${getBaseUrl()}/api/orpc`,
})

const client: RouterClient<ORPCRouter> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
