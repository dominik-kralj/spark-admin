// @vitest-environment node
import { describe, expect, it } from 'vitest'

import type { z } from 'zod'

import {
    dateField,
    filterPin,
    keepDigits,
    normalisePlate,
    oibField,
    optionalDateField,
    pinField,
    plateField,
} from './validation'

function messagesFor(schema: z.ZodType, value: string) {
    return schema.safeParse(value).error?.issues.map((issue) => issue.message)
}

describe('normalisePlate', () => {
    it.each([
        ['zg 1234-ab', 'ZG1234AB'],
        ['  ZG 1234 AB  ', 'ZG1234AB'],
        ['zg\t1234 ab', 'ZG1234AB'],
        ['ZG–1234—AB', 'ZG1234AB'],
        ['čk 123-šđ', 'ČK123ŠĐ'],
        ['ZG1234AB', 'ZG1234AB'],
    ])('turns "%s" into %s', (typed, stored) => {
        expect(normalisePlate(typed)).toBe(stored)
    })

    it('is idempotent', () => {
        const once = normalisePlate(' zg 12-ab ')

        expect(normalisePlate(once)).toBe(once)
    })

    it('keeps characters it does not remove, so validation can flag them', () => {
        expect(normalisePlate('zg.1234/ab')).toBe('ZG.1234/AB')
    })
})

describe('plateField', () => {
    it('accepts a typed plate and outputs it normalised', () => {
        expect(plateField.parse('zg 1234-ab')).toBe('ZG1234AB')
    })

    it.each([
        ['three digits and one letter', 'st 123-a', 'ST123A'],
        ['four digits and two letters', 'RI 9999-ZZ', 'RI9999ZZ'],
        ['Croatian letters', 'čk 123-šđ', 'ČK123ŠĐ'],
    ])('accepts %s', (_case, typed, stored) => {
        expect(plateField.parse(typed)).toBe(stored)
    })

    it.each([
        ['', 'required'],
        ['  -  ', 'required'],
        ['ZG.1234-AB', 'plateInvalid'],
        ['ZG/1234-AB', 'plateInvalid'],
        ['Z 1234-AB', 'plateInvalid'],
        ['ZAG 1234-AB', 'plateInvalid'],
        ['ZG 12-AB', 'plateInvalid'],
        ['ZG 12345-AB', 'plateInvalid'],
        ['ZG 1234', 'plateInvalid'],
        ['ZG 1234-ABC', 'plateInvalid'],
        ['1234-AB', 'plateInvalid'],
        ['ZG 1234-AQ', 'plateInvalid'],
        ['ZG 1234-W', 'plateInvalid'],
        ['ZG 1234-XY', 'plateInvalid'],
        ['QG 1234-AB', 'plateInvalid'],
        ['ZG 1234-AÖ', 'plateInvalid'],
    ])('rejects "%s" with %s', (typed, message) => {
        expect(messagesFor(plateField, typed)).toEqual([message])
    })
})

describe('oibField', () => {
    it('accepts exactly 11 digits, trimming pasted spaces at the ends', () => {
        expect(oibField.parse(' 12345678901 ')).toBe('12345678901')
    })

    it.each([
        ['', 'required'],
        ['1234567890', 'oibInvalid'],
        ['123456789012', 'oibInvalid'],
        ['1234567890A', 'oibInvalid'],
        ['123 456 789 01', 'oibInvalid'],
    ])('rejects "%s" with %s', (typed, message) => {
        expect(messagesFor(oibField, typed)).toEqual([message])
    })
})

describe('filterPin', () => {
    it.each([
        ['1234', '1234'],
        ['12a3', '123'],
        [' 1 2 3 4 ', '1234'],
        ['123456', '1234'],
        ['abc', ''],
    ])('keeps only the first four digits of "%s"', (typed, kept) => {
        expect(filterPin(typed)).toBe(kept)
    })

    it('is idempotent', () => {
        expect(filterPin(filterPin('9a8b7c6d5'))).toBe('9876')
    })
})

describe('pinField', () => {
    it.each(['1', '0042', '9999'])('accepts "%s"', (pin) => {
        expect(pinField.parse(pin)).toBe(pin)
    })

    it.each([
        ['', 'required'],
        ['12345', 'pinInvalid'],
        ['12a', 'pinInvalid'],
    ])('rejects "%s" with %s', (typed, message) => {
        expect(messagesFor(pinField, typed)).toEqual([message])
    })
})

describe('dateField', () => {
    it.each([
        ['31.12.2026', { year: 2026, month: 12, day: 31 }],
        ['31.12.2026.', { year: 2026, month: 12, day: 31 }],
        ['1.2.2027', { year: 2027, month: 2, day: 1 }],
        [' 31. 12. 2026. ', { year: 2026, month: 12, day: 31 }],
        ['29.02.2028', { year: 2028, month: 2, day: 29 }],
        ['29.02.2000', { year: 2000, month: 2, day: 29 }],
    ])('reads "%s" as a calendar date', (typed, date) => {
        expect(dateField.parse(typed)).toEqual(date)
    })

    it.each([
        ['', 'required'],
        ['   ', 'required'],
        ['2026-12-31', 'dateFormat'],
        ['31/12/2026', 'dateFormat'],
        ['31.12.26', 'dateFormat'],
        ['31122026', 'dateFormat'],
        ['31.12.2026..', 'dateFormat'],
        ['31.02.2027', 'dateInvalid'],
        ['29.02.2027', 'dateInvalid'],
        ['29.02.1900', 'dateInvalid'],
        ['31.04.2027', 'dateInvalid'],
        ['00.01.2027', 'dateInvalid'],
        ['15.13.2027', 'dateInvalid'],
        ['01.01.0000', 'dateInvalid'],
    ])('rejects "%s" with %s', (typed, message) => {
        expect(messagesFor(dateField, typed)).toEqual([message])
    })
})

describe('optionalDateField', () => {
    it.each(['', '   '])('reads %j as no date', (typed) => {
        expect(optionalDateField.parse(typed)).toBeNull()
    })

    it('reads a typed date', () => {
        expect(optionalDateField.parse('6.10.2026')).toEqual({ year: 2026, month: 10, day: 6 })
    })

    it.each([
        ['2026-10-06', 'dateFormat'],
        ['31.02.2027', 'dateInvalid'],
    ])('rejects "%s" with %s', (typed, message) => {
        expect(messagesFor(optionalDateField, typed)).toEqual([message])
    })
})

describe('keepDigits', () => {
    it('drops everything but digits', () => {
        expect(keepDigits(' 12 345-678a90 ')).toBe('1234567890')
    })
})
