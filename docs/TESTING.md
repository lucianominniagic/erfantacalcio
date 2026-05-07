# Testing Guide — ErFantacalcio

## Overview

This project uses **Vitest** for unit and integration testing. Vitest is a blazing fast unit testing framework powered by Vite, with great TypeScript support and similar API to Jest.

## Running Tests

### Single run

```bash
npm test
```

Runs all test files once and exits.

### Watch mode

```bash
npm run test:watch
```

Watches for file changes and reruns relevant tests automatically. Great for TDD workflow.

### Coverage report

```bash
npm run test:coverage
```

Generates a coverage report using v8 provider. Coverage reports are printed to console and can be found in `coverage/` directory.

## Test Structure

### File organization

```
src/
├── components/
│   └── squadra/
│       ├── utils.ts          # Production code
│       └── utils.test.ts       # Test file
├── server/
│   ├── routers/
│   │   ├── transfer.ts        # Production code
│   │   └── transfer.test.ts    # Test file
│   └── utils/
│       ├── scoring.ts         # Production code
│       └── scoring.test.ts     # Test file
```

**Convention**: Place `.test.ts` files in the same directory as the code they test.

### Test file naming

- `*.test.ts` — unit or integration tests for a specific file
- Test files are automatically discovered via `vitest.config.ts` include pattern

## Writing Tests

### Basic structure

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  it('should do something specific', () => {
    // Arrange
    const input = {
      /* ... */
    }

    // Act
    const result = someFunction(input)

    // Assert
    expect(result).toBe(expectedValue)
  })

  it('should handle edge case', () => {
    // Test edge cases, error conditions, etc.
  })
})
```

### Assertion examples

```typescript
// Value assertions
expect(value).toBe(5) // strict equality ===
expect(value).toEqual({ a: 1 }) // deep equality
expect(value).toBeTruthy() // truthy
expect(value).toBeNull() // null
expect(value).toBeUndefined() // undefined

// Array assertions
expect(array).toContain('item') // contains item
expect(array).toHaveLength(3) // length check
expect(array).toEqual(['a', 'b', 'c']) // exact match

// String assertions
expect(text).toMatch(/pattern/) // regex match
expect(text).toContain('substring') // substring check

// Function assertions
expect(fn).toThrow() // throws error
expect(fn).toHaveBeenCalled() // mock was called
expect(fn).toHaveBeenCalledWith(arg) // called with specific args
```

### Mocking

#### Mock functions

```typescript
import { vi } from 'vitest'

const mockFunction = vi.fn()
const mockWithReturn = vi.fn().mockReturnValue('result')

mockFunction.mockResolvedValue(data) // async mock
mockFunction.mockRejectedValue(error) // async error

expect(mockFunction).toHaveBeenCalledWith(args)
```

#### Mock modules

```typescript
import { vi } from 'vitest'

vi.mock('~/server/db/entities', () => ({
  Squadra: {
    findOne: vi.fn(),
    save: vi.fn(),
  },
}))

// In tests:
import { Squadra } from '~/server/db/entities'
// Squadra is now a mock
```

#### Mock tRPC context

```typescript
const mockCtx = {
  session: {
    user: {
      id: 1,
      ruolo: 'admin',
      idSquadra: 1,
      squadra: 'Test FC',
      presidente: 'Test User',
    },
  },
}

// Use in procedure testing:
const result = await myProcedure.createCaller(mockCtx)(input)
```

## Testing Domains

### Pure utility functions

- **Location**: `src/components/squadra/utils.ts`, `src/server/utils/*.ts`
- **What to test**: Happy path, edge cases, boundary conditions
- **Mocking**: Minimal/none — test in isolation
- **Example**: Scoring calculations, formation validation, sorting

### Business logic procedures (tRPC routers)

- **Location**: `src/server/routers/*.ts`
- **What to test**: Input validation, authorization, output shape
- **Mocking**: Mock database calls, mock external services
- **Example**: Transfer market rules, lineup submission

### Database interactions

- **Location**: Tests for entity manipulation
- **What to test**: Query correctness, relationship handling
- **Mocking**: TypeORM methods if unit testing, or use test database if integration testing
- **Example**: Classifica ranking, squad data aggregation

### Configuration and constants

- **Location**: `src/config.ts`
- **What to test**: Values are accessible, defaults exist
- **Mocking**: None — test actual configuration
- **Example**: Bonus configurations, allowed formations list

## Coverage Goals

### By domain (target coverage)

- **Pure utilities**: 90%+ (easy to test, no mocks needed)
- **Business logic**: 80%+ (complex logic, requires mocking)
- **Database**: 70%+ (integration heavy, more setup needed)
- **Configuration**: 100% (simple, no logic)

### What NOT to cover

- ❌ React component rendering (use Storybook or separate UI tests)
- ❌ tRPC route wiring (covered by TypeScript types)
- ❌ Database migrations (tested by running them on test database)
- ❌ External API calls in integration (mock them)

## Configuration

### vitest.config.ts

- **Environment**: `node` (no browser globals)
- **Include pattern**: `src/**/*.test.ts`
- **Coverage provider**: `v8`
- **Path alias**: `~` resolves to `src/`
- **Globals**: `describe`, `it`, `expect` available without imports

### Excluded from coverage

- `src/**/*.test.ts` — test files
- `src/app/**` — Next.js app files
- `src/components/**` — React components
- `src/styles/**` — CSS/styling
- `src/theme/**` — MUI theme
- `src/types/**` — TypeScript types
- `src/env.*` — environment config

## Tips & Best Practices

### ✅ Do

- Write descriptive test names: `it('should calculate score with capitano bonus and costo multiplier')`
- Test one behavior per test case
- Use `beforeEach` for common setup
- Mock external dependencies (database, API)
- Test edge cases: empty input, null, invalid data
- Keep tests fast — aim for < 100ms per test

### ❌ Don't

- Don't test implementation details — test behavior
- Don't make tests brittle by hardcoding time/dates (use mocks or fixed values)
- Don't test private functions directly (test through public API)
- Don't make network calls in unit tests (mock them)
- Don't write tests that depend on test execution order

## Debugging Tests

### Run single test

```bash
npm run test:watch -- --grep "test name pattern"
```

### Run tests for single file

```bash
npm run test:watch -- utils.test.ts
```

### Enable debug output

```typescript
import { debug } from 'vitest'

it('should do something', () => {
  const result = someFunction()
  debug(result) // print to console
})
```

### Use debugger

```typescript
it('should do something', () => {
  debugger // breakpoint in browser DevTools
  const result = someFunction()
})
```

Then run with: `node --inspect-brk ./node_modules/.bin/vitest`

## Critical Business Logic to Test

### Priority areas for comprehensive coverage

1. **Scoring calculations** (`src/server/utils/scoring.ts`)
   - Match scores with bonuses
   - Capitano doubling
   - Malus for suspended/injured players

2. **Classifica standings** (`src/server/utils/classifica.ts`)
   - Ranking by points
   - Tiebreaker logic

3. **Formazione validation** (`src/components/squadra/utils.ts`)
   - Formation modulo checking
   - Player role counts
   - Budget constraints

4. **Trasferimenti market rules** (`src/server/routers/transfer.ts`)
   - Budget deductions
   - Player availability
   - Contract constraints

5. **Voti grade processing** (`src/server/utils/voti.ts`)
   - Grade upload and aggregation
   - Player matching

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Fantacalcio Domain Concepts](../docs/DOMAIN.md) — understand game rules for realistic tests
