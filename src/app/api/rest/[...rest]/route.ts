/**
 * HTTP handler OpenAPI — Next.js App Router
 * Montato su /api/rest/[...rest]
 *
 * Usa OpenAPIHandler con il fetch adapter: accetta chiamate REST standard
 * (body JSON plain, senza wrapper {"json": ...} del protocollo nativo oRPC).
 * Utile per Swagger UI "Try it out" e per test manuali via Postman/curl.
 *
 * SOLO IN DEVELOPMENT — in produzione risponde 404.
 * Il client React usa /api/orpc (RPCHandler), non questo endpoint.
 */
import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { onError } from '@orpc/server'

import { createORPCContext } from '~/server/orpc'
import { orpcRouter } from '~/server/orpc-root'

const handler = new OpenAPIHandler(orpcRouter, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC REST]', error)
    }),
  ],
})

async function handleRequest(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 })
  }

  const context = await createORPCContext()

  const { matched, response } = await handler.handle(request, {
    prefix: '/api/rest',
    context,
  })

  if (matched) {
    return response
  }

  return new Response('Not Found', { status: 404 })
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
