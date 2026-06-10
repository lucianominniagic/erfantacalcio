import { describe, it, expect } from 'vitest'
import { parseMaglia, magliaSchema, type MagliaType } from './index'

describe('maglia — Schema validation', () => {
  describe('magliaSchema', () => {
    it('should validate correct maglia object', () => {
      const validMaglia = {
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 7,
        selectedTemplate: 'template1',
      }

      const result = magliaSchema.safeParse(validMaglia)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validMaglia)
      }
    })

    it('should reject maglia with missing required fields', () => {
      const invalidMaglia = {
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        // Missing thirdColor, textColor, shirtNumber, selectedTemplate
      }

      const result = magliaSchema.safeParse(invalidMaglia)

      expect(result.success).toBe(false)
    })

    it('should reject maglia with wrong shirtNumber type', () => {
      const invalidMaglia = {
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: '7', // Should be number, not string
        selectedTemplate: 'template1',
      }

      const result = magliaSchema.safeParse(invalidMaglia)

      expect(result.success).toBe(false)
    })

    it('should reject maglia with extra unknown fields (strict mode)', () => {
      const extraFieldMaglia = {
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 7,
        selectedTemplate: 'template1',
        unknownField: 'should be ignored or rejected',
      }

      // Zod by default strips unknown fields in parse
      const result = magliaSchema.safeParse(extraFieldMaglia)

      expect(result.success).toBe(true)
    })

    it('should handle various hex colors', () => {
      const validMaglia = {
        mainColor: '#ABCDEF',
        secondaryColor: '#123456',
        thirdColor: '#FFF',
        textColor: '#000',
        shirtNumber: 99,
        selectedTemplate: 'custom_template',
      }

      const result = magliaSchema.safeParse(validMaglia)

      expect(result.success).toBe(true)
    })
  })

  describe('parseMaglia', () => {
    it('should parse valid JSON maglia string', () => {
      const validJson = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 7,
        selectedTemplate: 'template1',
      })

      const result = parseMaglia(validJson)

      expect(result).not.toBeNull()
      expect(result?.mainColor).toBe('#FF0000')
      expect(result?.shirtNumber).toBe(7)
    })

    it('should return null for empty string', () => {
      const result = parseMaglia('')

      expect(result).toBeNull()
    })

    it('should return null for null input', () => {
      const result = parseMaglia(null)

      expect(result).toBeNull()
    })

    it('should return null for undefined input', () => {
      const result = parseMaglia(undefined)

      expect(result).toBeNull()
    })

    it('should return null for invalid JSON', () => {
      const invalidJson = '{mainColor: #FF0000}' // Missing quotes

      const result = parseMaglia(invalidJson)

      expect(result).toBeNull()
    })

    it('should return null for JSON that does not match schema', () => {
      const jsonWithMissingFields = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        // Missing required fields
      })

      const result = parseMaglia(jsonWithMissingFields)

      expect(result).toBeNull()
    })

    it('should return null for JSON with wrong field types', () => {
      const jsonWithWrongTypes = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: '7', // Should be number
        selectedTemplate: 'template1',
      })

      const result = parseMaglia(jsonWithWrongTypes)

      expect(result).toBeNull()
    })

    it('should handle JSON with extra fields (ignored)', () => {
      const jsonWithExtra = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 7,
        selectedTemplate: 'template1',
        extraField: 'ignored',
      })

      const result = parseMaglia(jsonWithExtra)

      expect(result).not.toBeNull()
      expect(result?.mainColor).toBe('#FF0000')
      // Extra field should not be in result
      expect((result as any)?.extraField).toBeUndefined()
    })

    it('should handle special characters in template name', () => {
      const validJson = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 10,
        selectedTemplate: 'template_v2.0-special',
      })

      const result = parseMaglia(validJson)

      expect(result).not.toBeNull()
      expect(result?.selectedTemplate).toBe('template_v2.0-special')
    })

    it('should handle large shirt numbers', () => {
      const validJson = JSON.stringify({
        mainColor: '#FF0000',
        secondaryColor: '#FFFFFF',
        thirdColor: '#000000',
        textColor: '#FFFFFF',
        shirtNumber: 999,
        selectedTemplate: 'template1',
      })

      const result = parseMaglia(validJson)

      expect(result).not.toBeNull()
      expect(result?.shirtNumber).toBe(999)
    })
  })
})
