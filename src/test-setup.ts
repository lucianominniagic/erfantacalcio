/**
 * Vitest global setup — mocks Next.js / NextAuth dependencies
 * that cannot be loaded in a plain Node test environment.
 *
 * This file is referenced by vitest.config.ts → test.setupFiles.
 * Mocks are hoisted so they apply to all test files.
 */
import { vi } from 'vitest'

// Mock ~/server/api/trpc so procedure files can be imported without
// triggering the Next.js / next-auth module chain.
vi.mock('~/server/api/trpc', () => {
  const noop = () => ({})
  const buildProcedure = () => {
    const procedure: any = {
      use: () => buildProcedure(),
      input: () => buildProcedure(),
      query: () => noop,
      mutation: () => noop,
    }
    return procedure
  }
  return {
    createTRPCRouter: (routes: Record<string, unknown>) => routes,
    publicProcedure: buildProcedure(),
    protectedProcedure: buildProcedure(),
    adminProcedure: buildProcedure(),
  }
})
