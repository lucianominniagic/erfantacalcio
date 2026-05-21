/**
 * Swagger UI — solo in development
 * GET /api/docs  → HTML con Swagger UI (CDN)
 * GET /api/docs?format=json → OpenAPI spec JSON
 *
 * In produzione risponde 404 per non esporre la superficie API.
 */
import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod'
import { NextRequest } from 'next/server'

import { orpcRouter } from '~/server/orpc-root'

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
})

export async function GET(request: NextRequest): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Not Found', { status: 404 })
  }

  const { searchParams } = request.nextUrl
  const format = searchParams.get('format')

  // Genera lo spec OpenAPI dal router oRPC.
  // Il server base punta a /api/rest (OpenAPIHandler) che accetta plain JSON
  // REST-style — compatibile con Swagger UI "Try it out" e Postman.
  const spec = await generator.generate(orpcRouter, {
    info: {
      title: 'ErFantacalcio oRPC API',
      version: '1.0.0',
      description: 'Documentazione API generata automaticamente da oRPC',
    },
    servers: [{ url: '/api/rest' }],
  })

  // Ritorna lo spec grezzo come JSON
  if (format === 'json') {
    return new Response(JSON.stringify(spec, null, 2), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Ritorna Swagger UI HTML (CDN) con spec inline
  const specJson = JSON.stringify(spec)
  const html = `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ErFantacalcio — API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        const spec = ${specJson};
        SwaggerUIBundle({
          spec,
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
          deepLinking: true,
        });
      };
    </script>
  </body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
