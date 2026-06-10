/**
 * HTTP handler oRPC — Next.js App Router
 * Montato su /api/orpc/[...rest]
 *
 * Usa RPCHandler con il fetch adapter (compatibile Edge/Node.js).
 * Il context viene creato per ogni richiesta tramite createORPCContext().
 *
 * Il protocollo RPC nativo di oRPC serializza nativamente tutti i tipi
 * supportati da SuperJSON (Date, BigInt, Map, Set, undefined, …).
 *
 * tRPC continua a girare su /api/trpc — i due handler sono indipendenti.
 */
import { RPCHandler } from '@orpc/server/fetch'
import { onError } from '@orpc/server'

import { createORPCContext } from '~/server/orpc'
import { orpcRouter } from '~/server/orpc-root'

const handler = new RPCHandler(orpcRouter, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC]', error)
    }),
  ],
})

async function handleRequest(request: Request): Promise<Response> {
  const context = await createORPCContext()

  const { matched, response } = await handler.handle(request, {
    prefix: '/api/orpc',
    context,
  })

  if (matched) {
    return response
  }

  return new Response('Not Found', { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
